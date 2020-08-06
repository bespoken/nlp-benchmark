# SQL Queries
## NLP_BENCHMARK view
CREATE OR REPLACE
ALGORITHM = UNDEFINED VIEW `bespoken`.`NLP_BENCHMARK` AS
select
    *
from
    `bespoken`.`NLP_BENCHMARK_GOOGLE`
union
select
    *
from
    `bespoken`.`NLP_BENCHMARK_ALEXA`
from
    `bespoken`.`NLP_BENCHMARK_ALEXA`