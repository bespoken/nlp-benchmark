select count(*), platform from NLP_BENCHMARK nb where lower(transcript) like '%wikipedia%'
group by platform;

select count(*), platform from NLP_BENCHMARK nb where lower(transcript) like '%wikipedia%'
group by platform;


select count(*), platform from NLP_BENCHMARK nb where lower(transcript) like '%answers%'
group by platform;


select count(*), platform from NLP_BENCHMARK nb where lower(transcript) like '%according to%'
group by platform;

select transcript, platform from NLP_BENCHMARK nb where lower(transcript) like '%according to%';
select transcript, platform from NLP_BENCHMARK nb where lower(transcript) like '%okay I found this on the web%';

select transcript from NLP_BENCHMARK nb  where platform='siri'


