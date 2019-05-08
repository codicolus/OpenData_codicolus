library(tidyverse)

#define the length of each fixed-width column
lengths <- c(
  str_length("stn                                       "),
  str_length("Name                         "),
  str_length("Länge/Breite                              "),
  str_length("KM-Koordinaten                            "),
  str_length("Höhe")
)

# specify the colnames
col_names <- c("Station", "Name", "Länge/Breite", "Koordinaten", "Höhe")

# read in the data
data <- read_fwf("data/station_data.txt.txt", col_positions = fwf_widths(lengths, col_names = col_names),
                 trim_ws = T, skip = 2, locale = locale(encoding = "ISO-8859-1"))

rm(col_names, lengths)

# transform coordinates to lon / lat in separate columns
coords <- as.vector(as.matrix((as.data.frame(select(data, Koordinaten)))))
splitted <- strsplit(coords, "/")

lon <- c()
lat <- c()

for (i in 1:length(splitted)){
  lon <- c(lon, splitted[[i]][1])
  lat <- c(lat, splitted[[i]][2])
}

rm(splitted, coords, i)

# select needed variables
new <- select(data, Station, Name, Höhe)
new <- mutate(new,
              Longitude = lon,
              Latitude = lat)

# Writing CSV
write_csv(new, "data/meteo.csv")




