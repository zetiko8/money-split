## upload to nginx
FROM nginx:alpine

# add certificates
COPY nginx-selfsigned.crt /etc/nginx/ssl/nginx-selfsigned.crt
COPY nginx-selfsigned.key /etc/nginx/ssl/nginx-selfsigned.key

# add ngnix config
RUN rm -rf /etc/nginx/nginx.conf
COPY /nginx.conf /etc/nginx

EXPOSE 80
