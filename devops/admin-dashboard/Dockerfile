## upload to nginx
FROM nginx:alpine

# copy bundle
COPY /dist /usr/share/nginx/html

# add certificates
COPY nginx-selfsigned.crt /etc/nginx/ssl/nginx-selfsigned.crt
COPY nginx-selfsigned.key /etc/nginx/ssl/nginx-selfsigned.key

# add spa config
RUN rm -rf /etc/nginx/nginx.conf
COPY /nginx.conf /etc/nginx

EXPOSE 80

# When the container starts, replace the env.js with values from environment variables
CMD ["/bin/sh",  "-c",  "envsubst < /usr/share/nginx/html/assets/config/config.tpl.json > /usr/share/nginx/html/assets/config/config.json && exec nginx -g 'daemon off;'"]