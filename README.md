![unit-test](https://github.com/bespoken/nlp-benchmark/workflows/unit-test/badge.svg)
[![codecov](https://codecov.io/gh/bespoken/nlp-benchmark/branch/master/graph/badge.svg?token=WD9586ROEQ)](https://codecov.io/gh/bespoken/nlp-benchmark)
![standard](https://github.com/bespoken/nlp-benchmark/workflows/standard/badge.svg)

# Bespoken Benchmarking Project
This is Bespoken's open-source benchmarking project.

This provides a general mechanism for testing and evaluating NLP platforms.

We have conducted two tests so far:  
* Voice assistant open-domain question answering - [see the results](https://benchmark.bespoken.io)
* Digital contact center ASR - [see the results](https://benchmark.bespoken.io/ivr)

## Process
We interact with the voice assistants using the Bespoken Device Service - which allow us to interact exactly as a real person would with an actual device. [Read more here](https://bespoken.io/test-robot).

For running the tests and collecting the results, we leverage our batch testing framework:  
https://gitlab.com/bespoken/batch-tester

## Benchmark Results
Results are meant to published on a bi-monthly basis. The table below summarizes our tests and results to-date:

| Date | Test Type | Data Set | Platforms | Results
|---|---|---|---|---
| 7/26/2020 | General Knowledge | ComQA | Alexa, Google Assistant, Siri | LINK TBA
| 11/20/2020 | Speech Recognition | DefinedCrowd | Amazon Connect, Google Dialogflow, Twilio Voice | LINK TBA

The published results are viewable here:  
https://benchmark.bespoken.io

## Methodology
### General Knowledge
We classify answers as correct or not by the presence of the answer from the dataset.

In the case where the dataset has multiple answers, if anyone is present we include it.
[Read more here](https://benchmark.bespoken.io/nlp/protocol)
### Speech Recognition Accuracy
We take datasets from DefinedCrowd and run them through the various platforms using our Virtual Devices for IVR:
<div><img src='/web/images/IVRBenchmarkProtocol.png' height='400' /></div>

[Read more here](https://benchmark.bespoken.io/ivr/protocol)

## Contact
We appreciate all feedback. Open an issue to suggest additional datasets as well as improvements to our methodology.

Contact us at [contact@bespoken.io](mailto:contact@bespoken.io).

