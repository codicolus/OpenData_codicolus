
(file <- read.csv2("data/stations_data.csv", header = T, sep = ";", na.strings = "-"))
file <- as.data.frame(file)

index <- rep(NA, length(file[,1]))

cols <- colnames(file)

for(i in 1:length(file[,1])){
  temp <- as.numeric(file[i,7])
  print(temp)
  prec <- as.numeric(file[i,8])
  sun <- as.numeric(file[i,9])
  glob <- as.numeric(file[i,10])
  feu <- as.numeric(file[i,11])
  wind <- as.numeric(file[i,14])
  
  if(!(is.na(temp) || is.na(prec) ||is.na(sun) ||is.na(glob) ||is.na(feu) ||is.na(wind))){
    index[i] <- 0.4*temp + 0.2*prec + 0.05*sun + 0.05*glob + 0.15*feu + 0.15*wind
  }
}

index <- as.integer(index)
file[,16] <- index

write.csv(file, "badeindex.csv", row.names = F, na = "-")
