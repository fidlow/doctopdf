
# DocToPDF
Преобразование XML документов в PDF. Реализован документ акта сдачи-приемки. Пример xml файла лежит в src/server/tests.

Стек: React, Nest.js, TypeScript, Node.js (версия 12), Nginx.
Фронтенд и бекенд в одном репозитории. Статика раздается с Nginx, rest-запросы обрабатываются Nest.js.

Docker
```shell script
docker build  --pull --rm -t 1.0.0 . && docker run -p 80:80 -p 443:443 -v ~/doctopdf:/www/ -name nginx 1.0.0
```
Сборка React
```shell script
npm run build:client
```
Запуск Nest.js
```shell script
npm run start:prod
```
