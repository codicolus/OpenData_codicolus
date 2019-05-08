# This script combines every preprocessing step including the Index calculation.
# Left to to after this step is:
#   1) IDW-Interpolation (QGIS or R)
#   2) Clipping + Vectorizing Interpolated Raster (QGIS)

# Loading libraries
library(tidyverse)
library(data.table)
library(bit64)

###################################################################################################
# Section 0: Auxiliary Functions
#
# Contribution of temperatur, precipitation, sunshine, globalstrahlung, feuchtigkeit, wind
# Temperature Contribution
temp_cont <- function(value, wgth){
  # if temperature is below zero then value set to zero as other factors are dominant
  # then the variable is "standardized" according to meaningful values
  # returned is the standardized value * weight
  min = 0
  max = 45
  
  if(value < 0){
    value = min
  }
  
  std <- 1 / max * value
  
  return(std*wgth)
}

# Precipitation Contribution
prec_cont <- function(value, wgth){
  # Principle: contribution only when no rain!
  if(value > 0){
    return(0)
  }
  
  return(wgth)
}

# Sunshine Contribution
sun_cont <- function(value, wgth){
  # min = 0
  max = 10
  
  std <- 1 / max * value
  
  return(std*wgth)
}

# Global Radiation Contribution
glob_cont <- function(value, wgth){
  max = 1000
  
  std <- 1 / max * value
  
  return(std*wgth)
}

# Relative Humidity Contribution
feu_cont <- function(value, wgth){
  max = 100
  
  std <- 1 / max * value
  
  # for extremely high RH the weight is halved
  if(value > 90){
    wgth = wgth * 0.5
  }
  
  return(std * wgth)
}

# Wind Speed Contribution
wind_cont <- function(value, wgth){
  # max acceptable wind speed = 25
  # the higher the speed the less less it contributes to the index
  max = 25
  
  if(value > 25){
    value = max
  }
  
  std <- 1 / max * value
  
  return((1-std)*wgth)
}

###################################################################################################
# Section 1: Get newest data + preprocessing for index calculation

# 1.1 Read and Process newest Meteo-Station data
url <- "https://data.geo.admin.ch/ch.meteoschweiz.messwerte-aktuell/VQHA80.csv"

(ms_data <- as.data.frame(fread(url, na.strings = "-")))
cols_orig <- colnames(ms_data)

cols_new <- c("Station", "Time", "Temperatur (°C)", "Niederschlag (mm)", "Sonnenschein (min)", 
              "Globalstrahlung (W/m^2)", "Luftfeuchtigkeit (%)", "Taupunkt (°C)", "Windrichtung (°)", 
              "Windgeschwindigkeit (km/h)", "Böenspitze (km/h)", "Luftdruck auf Stationshöhe (QFE, hPa)", 
              "Luftdruck auf Meeresniveau (QFF, hPa)", "Luftdruck reduziert auf Meereshöhe mit Standard-Atmosphäre (QNH, hPa)",
              "Geopotential 850hPa (gpm)", "Geopotential 700hPa (gpm)", "Windrichtung vekt (°)",
              "Windgeschw. Turm (km/h)", "Böenspitze Turm (km/h)", "Lufttemperatur Instr 1 (°C)",
              "RH Turm (%)", "Taupunkt Turm (°C)")

# Define shortcut variable names through new Column names
colnames(ms_data) <- cols_new

# Subset required for Badewetter-Index
subset_cols <- cols_new[c(1:7, 10)]
badewetter_subset <- ms_data[, subset_cols]

# clean workspace
rm(list=setdiff(ls(), c("badewetter_subset", "subset_cols")))


###################################################################################################
# Section 2: Get Metadata from stations
meta_path <- "data/metadata.txt"

#define fix-width lengths
#define the length of each fixed-width column
lengths <- c(
  str_length("stn                                       "),
  str_length("Name                         "),
  str_length("Länge/Breite                              "),
  str_length("KM-Koordinaten                            "),
  str_length("Höhe")
)

# Colnames within dataset (hard-coded = must be known in advance!)
col_names <- c("Station", "Name", "Länge/Breite", "Koordinaten", "Höhe")
# read-in metadata
data <- read_fwf(meta_path, col_positions = fwf_widths(lengths, col_names = col_names),
                 trim_ws = T, skip = 2, locale = locale(encoding = "ISO-8859-1"))

# transform coordinates to lon / lat in separate columns
coords <- as.vector(as.matrix((as.data.frame(select(data, Koordinaten)))))
splitted <- strsplit(coords, "/")

lon <- c()
lat <- c()

for (i in 1:length(splitted)){
  lon <- c(lon, splitted[[i]][1])
  lat <- c(lat, splitted[[i]][2])
}

# select needed variables
meta <- select(data, Station, Name, Höhe)
meta <- mutate(meta,
              Longitude = lon,
              Latitude = lat)

#clean workspace
# Attention: badewetter_subset should be kept in scope! Otherwise code failures will occur
rm(list=setdiff(ls(), c("badewetter_subset", "meta")))


###################################################################################################
# Section 3: Joining Data-Tables together by "Station"
joined <- right_join(meta, badewetter_subset, by="Station")

joined <- as.data.frame(joined)

###################################################################################################
# Section 4: INDEX CALCULATION
# get dimensions r-rows, c-cols
dims <- dim(joined)
r <- dims[1]
c <- dims[2]
# Badewetter-Index Calculation
index <- rep(NA, r)

cols <- colnames(joined)

for(i in 1:r){
  temp <- as.numeric(joined[i,grep("Temp+", cols)])
  print(temp)
  prec <- as.numeric(joined[i,grep("Nieder+", cols)])
  sun <- as.numeric(joined[i,grep("Sonnen+", cols)])
  glob <- as.numeric(joined[i,grep("Global+", cols)])
  feu <- as.numeric(joined[i,grep("Luftfeu+", cols)])
  wind <- as.numeric(joined[i,grep("Windgesch+", cols)])
  
  if(!(is.na(temp) || is.na(prec) ||is.na(sun) ||is.na(glob) ||is.na(feu) ||is.na(wind))){
    
    #index[i] <- 0.4*temp + 0.2*prec + 0.05*sun + 0.05*glob + 0.15*feu + 0.15*wind
    
    index[i] <- temp_cont(temp, 0.4) + prec_cont(prec, 0.2) + sun_cont(sun, 0.05) + glob_cont(glob, 0.05) +
      feu_cont(feu, 0.15) + wind_cont(wind, 0.15)
  }
}

index <- as.integer(index)
joined[,c+1] <- index
colnames(joined)[c+1] <- "Index"

cols <- colnames(joined)

###################################################################################################
# Section 5: WRITING END-PRODUCT FILES FOR USE IN QGIS
#Write csv
write.csv(file, "badeindex.csv", row.names = F, na = "-", fileEncoding = "ISO-8859-1")

# defining what variable type each column is (required for reading in QGIS)
col_type <- c("\"String\", \"String\", \"Real\", \"Real\", \"Real\", \"Real\", \"Real\", \"Real\", \"Real\", \"Real\", \"Real\", \"Real\", \"Real\"")

write(col_type, "badeindex.csvt", ncolumns = length(cols))


