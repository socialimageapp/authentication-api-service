# AdVenturAI Authentication Service

The authentication services deals with users/services, oauth2, accounts, roles, permissions and more.

To run the API simply run:

```
yarn install && yarn dev
```

## Connect to VPS

```
ssh -i ~/.ssh/id_rsa root@49.12.226.8
```

## SSL Certs

```
sudo certbot certonly --manual --preferred-challenges=dns -d "adventur.ai" -d "*.adventur.ai" -d "*.test.adventur.ai"
```

Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/adventur.ai/fullchain.pem
Key is saved at: /etc/letsencrypt/live/adventur.ai/privkey.pem
This certificate expires on 2025-03-08.
These files will be updated when the certificate renews.

NEXT STEPS:

- This certificate will not be renewed automatically. Autorenewal of --manual certificates requires the use of an authentication hook script (--manual-auth-hook) but one was not provided. To renew this certificate, repeat this same certbot command before the certificate's expiry date.

---

If you like Certbot, please consider supporting our work by:

- Donating to ISRG / Let's Encrypt: https://letsencrypt.org/donate
- Donating to EFF: https://eff.org/donate-le

```
https://toolbox.googleapps.com/apps/dig/#TXT/_acme-challenge.adventur.ai.
```
