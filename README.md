# The Walken Closet

A tiny, deliberately silly static website. No build, packages, fonts, analytics, or external requests. The supplied transparent `cw.png` is copied unchanged to `assets/walken.png`.

## Run

Open `index.html` directly in a modern browser, or serve this directory:

```sh
python3 -m http.server 8000
```

Visit http://localhost:8000. Click the closet, or focus it with Tab and press Enter or Space. The door opens, Christopher rocks into it, the door closes, and the counter increments. The button locks for each cycle. The count is per page session and resets on reload; it is not shared across visitors. Reduced-motion preferences use a short transition instead of rocking.

## Deploy to S3 + CloudFront

Upload these four files, preserving the directory structure:

```text
index.html
styles.css
script.js
assets/walken.png
```

For example, with your own bucket name and an already configured AWS CLI:

```sh
aws s3 cp index.html s3://YOUR-BUCKET/index.html --content-type text/html
aws s3 cp styles.css s3://YOUR-BUCKET/styles.css --content-type text/css
aws s3 cp script.js s3://YOUR-BUCKET/script.js --content-type application/javascript
aws s3 cp assets/walken.png s3://YOUR-BUCKET/assets/walken.png --content-type image/png
```

Use the S3 bucket as the CloudFront origin with Origin Access Control (OAC), and grant that distribution access through the bucket policy. Keep the bucket private. Set CloudFront's **Default root object** to `index.html` (no leading slash), and redirect HTTP viewers to HTTPS. The CloudFront distribution domain provides an HTTPS address. No server routes or SPA fallback are needed.

On later updates, invalidate the changed paths in CloudFront if cached content is still being served. This project does not create AWS resources or deploy anything automatically.

AWS references:
- https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/DefaultRootObject.html
- https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html

## Checks performed

- JavaScript syntax check.
- Automated sequence checks: count updates after closure, overlapping clicks ignored, repeat cycles, reduced motion, animation interruption recovery, missing image handling.
- Browser checks of the actual image, door interaction, counter updates, keyboard activation, and 390px mobile layout.

The lightweight animation checks are in `work/test-animation.cjs`; run with `node work/test-animation.cjs`. The `work/` and `outputs/` folders do not need to be uploaded.
