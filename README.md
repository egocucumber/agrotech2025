This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# AgroVzor - Система мониторинга сельхозтехники

Система для мониторинга и анализа работы сельскохозяйственной техники во время уборки урожая.

## Возможности

### Базовый функционал
- Управление предприятиями, сотрудниками и техникой
- Учет типов и моделей сельхозтехники
- Управление культурами (виды и сорта)
- Допуски сотрудников к технике
- Планирование и учет работ на поле
- Учет рабочих выездов
- Получение данных с техники в реальном времени

### Аналитические функции
- **Подсчет потерь зерна** - анализ потерь по весу или уровню заполненности
- **Вибродиагностика** - мониторинг вибрации рабочих органов с детекцией аномалий
- **Мониторинг топлива** - отслеживание уровня топлива и детекция кражи
- **Индекс эффективности механизатора** - оценка работы операторов по нескольким параметрам
- **Система сбора команды** - автоматический подбор механизаторов и техники для работы

## Технологии

- Java 17
- Spring Boot 4.0.0
- Spring Data JPA
- PostgreSQL 16
- Docker & Docker Compose
- Gradle
- Lombok
- **SpringDoc OpenAPI 3 (Swagger)** - интерактивная документация API

## Запуск проекта

### Требования
- Docker
- Docker Compose

### Запуск через Docker Compose

1. Клонируйте репозиторий

2. Запустите проект:
```bash
docker-compose up --build
```

Это запустит:
- PostgreSQL на порту 5432
- Spring Boot приложение на порту 8080
- **Swagger UI на http://localhost:8080/swagger-ui.html** 🎉

### Локальная разработка

1. Запустите PostgreSQL:
```bash
docker-compose up postgres
```

2. Соберите проект:
```bash
./gradlew build
```

3. Запустите приложение:
```bash
./gradlew bootRun
```

## 📚 Swagger API Documentation

После запуска приложения, интерактивная документация API доступна по адресу:

### 🌐 Swagger UI
**URL:** http://localhost:8080/swagger-ui.html

Здесь вы найдете:
- 📖 **Полное описание всех endpoints** с подробными комментариями
- 🎯 **Интерактивное тестирование API** - можно отправлять запросы прямо из браузера
- 📝 **Примеры запросов и ответов** для каждого endpoint
- 🏷️ **Группировка по функциональности** (Предприятия, Сотрудники, Аналитика и т.д.)
- 🔍 **Поиск по операциям** - быстрый поиск нужного endpoint
- ✨ **Подсветка синтаксиса** для JSON примеров

### 📄 OpenAPI Specification (JSON)
**URL:** http://localhost:8080/api-docs

Спецификация в формате OpenAPI 3.0 для:
- Генерации клиентского кода
- Интеграции с другими инструментами
- Автоматизации тестирования

### 💡 Особенности Swagger в AgroVzor

1. **Эмодзи для навигации** - каждая секция помечена иконкой для быстрого визуального поиска
2. **Подробные описания** - каждый endpoint содержит:
   - Что он делает
   - Когда его использовать
   - Примеры использования
   - Советы и рекомендации
3. **Реальные примеры данных** - все примеры основаны на реальных сценариях
4. **Описание бизнес-логики** - документация объясняет не только "как", но и "зачем"

### 🚀 Быстрый старт со Swagger

1. Откройте http://localhost:8080/swagger-ui.html
2. Найдите секцию "Предприятия"
3. Раскройте `POST /api/companies`
4. Нажмите "Try it out"
5. Используйте предзаполненный пример
6. Нажмите "Execute"
7. Получите результат! ✅

## API Endpoints

### Базовые операции

#### Предприятия
- `GET /api/companies` - список всех предприятий
- `GET /api/companies/{id}` - получить предприятие
- `POST /api/companies` - создать предприятие
- `PUT /api/companies/{id}` - обновить предприятие
- `DELETE /api/companies/{id}` - удалить предприятие

#### Сотрудники
- `GET /api/employees` - список всех сотрудников
- `GET /api/employees/{id}` - получить сотрудника
- `GET /api/employees/company/{companyId}` - сотрудники предприятия
- `POST /api/employees` - создать сотрудника
- `PUT /api/employees/{id}` - обновить сотрудника
- `DELETE /api/employees/{id}` - удалить сотрудника

#### Работы на поле
- `GET /api/field-works` - список всех работ
- `GET /api/field-works/{id}` - получить работу
- `GET /api/field-works/company/{companyId}` - работы предприятия
- `POST /api/field-works` - создать работу

#### Рабочие выезды
- `GET /api/work-shifts` - список всех выездов
- `GET /api/work-shifts/{id}` - получить выезд
- `GET /api/work-shifts/field-work/{fieldWorkId}` - выезды по работе
- `GET /api/work-shifts/employee/{employeeId}` - выезды сотрудника
- `POST /api/work-shifts` - создать выезд

#### Регулярные пакеты данных
- `GET /api/regular-packets` - все пакеты
- `GET /api/regular-packets/work-shift/{workShiftId}` - пакеты по выезду
- `POST /api/regular-packets` - добавить пакет

### Аналитика

#### Вибродиагностика
- `POST /api/analytics/vibration` - добавить данные вибрации
- `GET /api/analytics/vibration/work-shift/{workShiftId}` - данные по выезду
- `GET /api/analytics/vibration/anomalies` - все аномалии

#### Мониторинг топлива
- `POST /api/analytics/fuel` - добавить данные топлива
- `GET /api/analytics/fuel/work-shift/{workShiftId}` - данные по выезду
- `GET /api/analytics/fuel/theft-alerts` - оповещения о кражах

#### Потери зерна
- `POST /api/analytics/grain-loss/calculate/{workShiftId}` - рассчитать потери
- `GET /api/analytics/grain-loss/work-shift/{workShiftId}` - оценки по выезду
- `GET /api/analytics/grain-loss` - все оценки

#### Эффективность операторов
- `POST /api/analytics/efficiency/calculate/{workShiftId}` - рассчитать индекс
- `GET /api/analytics/efficiency/work-shift/{workShiftId}` - индексы по выезду
- `GET /api/analytics/efficiency` - все индексы

#### Сбор команды
- `GET /api/analytics/team-composition?companyId={id}&fieldWorkId={id}&harvesters={n}&transloaders={n}&grainTrucks={n}` - подобрать команду

## База данных

Hibernate автоматически создаст все необходимые таблицы при первом запуске.

### Основные таблицы:
- `companies` - предприятия
- `employees` - сотрудники
- `vehicle_types` - типы техники
- `vehicle_models` - модели техники
- `vehicle_units` - единицы техники
- `crop_species` - виды культур
- `crop_varieties` - сорта культур
- `field_works` - работы на поле
- `work_shifts` - рабочие выезды
- `regular_packets` - регулярные пакеты данных
- `call_events` - события вызова
- `unload_events` - события перегрузки
- `vibration_data` - данные вибродиагностики
- `fuel_data` - данные мониторинга топлива
- `grain_loss_estimates` - оценки потерь зерна
- `operator_efficiency_indices` - индексы эффективности

## Конфигурация

Основные настройки находятся в `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/agrovzor
spring.datasource.username=agrovzor
spring.datasource.password=agrovzor
server.port=8080
```

