
<!-- README.md is generated from README.Rmd. Please edit that file -->

# Datamations at CHI 2021

This is the Github repository for “Datamations: Animated Explanations of
Data Analysis Pipelines”, by  
Xiaoying Pu, Sean Kross, Jake M. Hofman, and Daniel G. Goldstein,
published at CHI ’21: Proceedings of the 2021 CHI Conference on Human
Factors in Computing Systems.

It includes everything needed to reproduce the figures and results in
the paper.

The paper is available online ([publisher
link](https://doi.org/10.1145/3411764.3445063),
[pdf](http://jakehofman.com/pdfs/datamations.pdf)) and supplementary
material is available [here](https://osf.io/85njc/).

If you would like to use Datamations yourself, please see this Github
repository for the latest code:
<https://github.com/microsoft/datamations>

## How to run `datamations_chi2021.Rmd`

1.  Make sure that `datamations_chi2021.Rmd` is in the current working
    directory. Use `setwd()` or `setwd(dirname(file.choose()))`.
2.  Finally run `rmarkdown::render("datamations_chi2021.Rmd")`.

The following packages are required:

| Package Name | Version     |
|:-------------|:------------|
| tidyverse    | 1.3.1       |
| lubridate    | 1.8.0       |
| knitr        | 1.36        |
| scales       | 1.1.1       |
| broom        | 0.7.10.9000 |
| pwr          | 1.3.0       |
| pacman       | 0.5.1       |

The script uses `pacman` to manage installation of the required packages
at these minimum version numbers. The `pacman::p_install_version`
command should ensure that you have *at least* these minimum version
numbers, but will allow for newer package versions as well. If you run
into difficulty when rendering the Rmarkdown file, it may help to
manually run the following:

``` r
install.packages("pacman")
pacman::p_install_version(
  c("tidyverse", "lubridate", "knitr", "scales", "broom", "pwr"),
  c("1.3.0", "1.7.9.2", "1.30", "1.1.1", "0.7.3", "1.3.0"))
```
