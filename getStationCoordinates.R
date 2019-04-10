# This short script is for scraping the coordinate-values + height values out of the MeteoSwiss-Metadata files
# used here: Weather Stations 10min
# Can be used for precipitation-station extension too

# Specifications
filename <- "./data/station_data.txt.txt"
outfilename <- "./data/coord_wetterstationen"

# Read in Text-File
data <- read.csv(file=filename, sep = "", header = F, skip = 2, na.strings = "")

# Convert from Factors to Chars
data_char <- cbind(as.character(data[,1]),as.character(data[,2]),as.character(data[,3]),as.character(data[,4]),
                   as.character(data[,5]))

# Convert Table to single-row vector
data_rows <- c()
for (i in 1:dim(data_char)[1]){
  data_rows <- c(data_rows, data_char[i,])
}

# Using Regex for determining indices of coordinates and height values
pattern <- "[0-9]{3}|[0-9]{4}|[0-9]{6}"

indizes <- grep(pattern, data_rows)

# Get only needed values and reformat it 
correct <- data_rows[indizes]
selected <- matrix(correct, nrow = 2)
selected <- t(selected)

# reformat coordinates
coords <- selected[,1]
splitted <- strsplit(coords, "/")

lon <- c()
lat <- c()

for (i in 1:length(splitted)){
  lon <- c(lon, splitted[[i]][1])
  lat <- c(lat, splitted[[i]][2])
}

# convert all columns to numeric values
lon <- as.numeric(lon)
lat <- as.numeric(lat)
height <- as.numeric(selected[,2])

# Final table
output <- cbind(lon, lat, height)
write.csv(output, file = outfilename, row.names = F)

# Clear Workspace
rm(list=ls())




