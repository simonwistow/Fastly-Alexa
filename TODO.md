## Misc
- Write a Makefile
- Write unit tests
- Allow local testing of fetching functions
- More commands? Rollback?

## Handle stats
- DeployIntent what is my {hit ratio|metric} for {example|service}
- DeployIntent what is my {requests per second|metric} for {example|service} in {ashburn|dc}
- DeployIntent what is my {miss latency|metric} for {example|service} in the {us-west|region} region

## Link Accounts
The correct way to get the API key is not to use .env files and have each user make their own app. In stead there should be one app which uses the "Link Accounts" functionality.

https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/linking-an-alexa-user-with-a-user-in-your-system

Unfortunately this requires us to have OAuth2


