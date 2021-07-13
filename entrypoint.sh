#!/bin/sh

# Replace env vars in JavaScript files
echo "Replacing env vars in JS"
for file in /usr/share/nginx/html/js/app.*.js;
do
  echo "Processing $file ...";

  # Use the existing JS file as template
  if [ ! -f $file.tmpl.js ]; then
    cp $file $file.tmpl.js
  fi

  envsubst '$VUE_APP_CLIENT_ID,$VUE_APP_CLIENT_SEC,$VUE_APP_REDIRECT_URI,$VUE_APP_CLIENT_ENTITY_TYPE_ID_ASSIGNMENT,$VUE_APP_CLIENT_ENTITY_TYPE_ID_SUBMISSION,$VUE_APP_CLIENT_ENTITY_TYPE_ID_GRADING,$VUE_APP_CLIENT_ROLE_PROFESSOR,$VUE_APP_CLIENT_ROLE_RESEARCH_ASSISTANT,$VUE_APP_CLIENT_ROLE_STUDENT,$VUE_APP_CLIENT_GROUP_ID_STUDENT,$VUE_APP_CLIENT_GROUP_ID_RESEARCH_ASSISTANT,$VUE_APP_CLIENT_PERMISSION_TYPE_VIEWER,$VUE_APP_CLIENT_PERMISSION_TYPE_EDITOR' < $file.tmpl.js > $file
done

echo "Starting Nginx"
nginx -g 'daemon off;'