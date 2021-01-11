setwd("~/Developer/GitHub/datamations/simpsons_multiple_choice_tibble/img/")

library(magick)

deg <- image_read("full-degree-tibble-raw.gif")
degind <- image_read("full-degree-industry-tibble-raw.gif")

# deg[1:170] %>% image_write("degree-tibble-p1.gif")
# degind[1:170] %>% image_write("degree-industry-tibble-p1.gif")
#
# deg[171:361] %>% image_write("degree-tibble-p2.gif")
# degind[171:361] %>% image_write("degree-industry-tibble-p2.gif")
#
# deg[362:426] %>% image_write("degree-tibble-p3.gif")
# degind[362:426] %>% image_write("degree-industry-tibble-p3.gif")

deg[c(rep(1, 40), 1:80)] %>% image_write("degree-tibble-p1.gif")
degind[c(rep(1, 40), 1:80)] %>% image_write("degree-industry-tibble-p1.gif")

deg[81:170] %>% image_write("degree-tibble-p2.gif")
degind[81:170] %>% image_write("degree-industry-tibble-p2.gif")

p3_index <- 171:426 %>%
  discard(~ .x > 250 && .x < 280) %>%
  discard(~ .x > 295 && .x < 320) %>%
  discard(~ .x > 333 && .x < 355)

deg[p3_index] %>% image_write("degree-tibble-p3.gif")
degind[p3_index] %>% image_write("degree-industry-tibble-p3.gif")

deg[426] %>% image_write("degree-tibble-end.gif")
degind[426] %>% image_write("degree-industry-tibble-end.gif")

index <- c(rep(1, 40), 1:170, p3_index)
index <- c(index, rep(426, 40))

deg[index] %>%  image_write("full-degree-tibble.gif")
degind[index] %>%  image_write("full-degree-industry-tibble.gif")
