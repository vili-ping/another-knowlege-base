# Another knowlege base

Что стоит улучшить и доработать, чтобы было хорошо:

1. Использовать Nest.js вместо чистого Node.js
2. Использовать TypeORM или аналогичное
3. Написать тесты
4. Разделить логику на слои
5. Добавить валидацию DTO
6. Добавить сваггер
7. Добавить нормальный auth с паролем, его хешированием и солтированием. Реализовать аuth на основе jwt
8. Нормальный роутинг и конфигурация тоже было бы хорошо

## Как запустить!

1. Создайте файл `.env` и скопируйте из `.env.sample` значения в `.env`
2. Выполните команду `docker-compose up -d`. Если у вас нет Docker - то установите его
3. Проект должен стать доступен по адресу http://localhost:3000

## Как пользоваться

Есть три сущности

- User

```json
{
  "id": "uuid"
  "email": "email"
}
```

- Article

```json
{
  "id": "uuid"
  "name": "string"
  "content": "string"
  "is_public": "boolean"
  "tags": "Tags[]"
}
```

- Tags

```json
{
  "id": "uuid"
  "name": "string"
}
```

## User-ручки

- GET /users/<email>
- POST /users

## Article-ручки

- GET /articles?tag=1&tag2
- GET /articles/<id>
- POST /articles
- PATCH /articles/<id>
- DELETE /articles/<id>

Надеюсь это все работает!
