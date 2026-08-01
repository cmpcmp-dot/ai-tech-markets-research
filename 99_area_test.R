library(tidyusmacro)
library(tidyverse)
library(lubridate)

se <- getBLSFiles("se", "rortybomb@gmail.com")

nrow(tibble(unique(se$area_name)))

se %>%
  filter(
    supersector_code == "00",
    seasonal == "S",
    data_type_code == "01",
    date %in% c("2019-12-01", "2026-05-01")
  ) %>%
  group_by(state_name, area_name) %>%
  reframe(
    last_value = value[date == max(date)],
    first_value = value[date == min(date)]
  ) %>%
  mutate(diff = last_value - first_value) %>%
  arrange(diff)
