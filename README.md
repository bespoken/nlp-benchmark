![unit-test](https://github.com/bespoken/nlp-benchmark/workflows/unit-test/badge.svg)

# Natural Language Processing benchmark
This is Bespoken's open-source NLP benchmarking project.

This provides a general mechanism for testing and evaluating NLP platforms.

## Datasets
This repository contains the following datasets:
* ComQA - [[Source](https://arxiv.org/abs/1809.09528)]
* Snips
* WikiQA

## Benchmark Results
Results are published on a monthly basis. The table below summarizes our tests and results to-date:

| Date | Test Type | Data Set | Platforms | Results
|---|---|---|---|---
| 7/26/2020 | General Knowledge | ComQA | Alexa, Google Assistant, Siri | LINK TBA
| 8/26/2020 | Speech Recognition | Commmon Voice | TBD | LINK TBA

The detailed results are viewable here:
URL: https://metabase.bespoken.io
Username: guest@bespoken.io
Password: Bespoken2020

## Methodology
### General Knowledge
We classify answers as correct or not by the presence of the answer from the dataset.

In the case where the dataset has multiple answers, if anyone is present we include it.

Tests are executed using the Bespoken Test Robots - which allow us to interact exactly as a real person would with an actual device. [Read more here](https://bespoken.io/test-robot).

### Speech Recognition Accuracy
TBC

## Contact
We appreciate all feedback. Open an issue to suggest additional datasets as well as improvements to our methodology.

Contact us at [support@bespoken.io](mailto:support@bespoken.io)

