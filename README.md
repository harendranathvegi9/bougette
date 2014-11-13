# Bougette

> Simple budgetting for US Bank accounts

Bougette is a scraper and webapp frontend which lists your recent transactions and shows you how much you've spent in various categories.

![Preview](https://raw.github.com/s3ththompson/bougette/master/preview.png)

# Usage

## Configuration

Save a US Bank profile to `~/.usbank/profile.yml`.

```yaml
# Example ~/.usbank/profile.yml
username: johnsmith
challenges:
  "What was the name of your best friend in high-school?": "Jane Doe"
  "What was the first concert you attended?": "My Bank"
  "What was your favorite teachers name?": "Mr. Jones"
# Account indexes appear in the account URL
credit: 5
checking: 1
```

## Scraper

Scrape your US Bank transactions to Firebase.

```sh
$ cd scraper
# Install gem dependencies
$ bundle install

# Update your US Bank transactions
# Enter your password when prompted
$ rake update
```

## Webapp

Deploy the webapp frontend.

```sh
$ cd webapp
# Install dependencies
$ npm install
# Preview the webapp locally
$ gulp server

# Deploy to Firebase
$ gulp build
$ firebase deploy
```