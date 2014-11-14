# Bougette

> Simple budgetting for US Bank accounts

Bougette is a scraper and webapp frontend which lists your recent transactions and shows you how much you've spent in various categories.

![Preview](https://raw.github.com/s3ththompson/bougette/master/preview.png)

# Usage

## Configuration

1) Create a new [Firebase](http://firebase.com) project.

2) Create a Firebase user through the web interface and note the UID.

3) Set up your Firebase security rules according to your user UID.
```json
{
    "rules": {
        ".read": "auth !== null && auth.uid == '<UID>'",
        ".write": "auth !== null && auth.uid == '<UID>'"
    }
}
```

4) Save a configuration profile to `scraper/profile.yml`.
```yaml
# Example scraper/profile.yml

# US Bank details
username: johnsmith
challenges:
  "What was the name of your best friend in high-school?": "Jane Doe"
  "What was the first concert you attended?": "My Bank"
  "What was your favorite teachers name?": "Mr. Jones"
# Account indexes appear in the account URL
credit: 5
checking: 1

# Firebase details
url: "http://myapp.firebaseio.com"
secret: "<SECRET>"
# Firebase user UID
uid: "<USER ID>"
```

5) Edit `webapp/src/js/app.jsx` and change the FIREBASE_URL to your own project's URL.

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