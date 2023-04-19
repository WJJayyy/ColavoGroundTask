# Booking Service API

이 API는 주어진 날짜, 지속 시간 및 기타 선택적 매개변수에 따라 예약 시스템의 사용 가능한 시간대를 검색하는 기능을 제공합니다.

## Getting Started

### Prerequisites

- Node.js (>= 14.x)
- npm (>= 6.x)

### Installing

1. Clone the repository:
   git clone https://github.com/WJJayyy/ColavoGroundTask.git

2. Install dependencies:
   npm install

3. Start the development server:
   npm run start:dev

The server should now be running on `http://localhost:8000`.

## API Usage

### Request

사용 가능한 시간대를 검색하려면 `/getTimeSlots` 엔드포인트에 POST 요청을 보냅니다.

Example request:

```json
{
  "start_day_identifier": "20210509",
  "timezone_identifier": "Asia/Seoul",
  "service_duration": 3600,
  "days": 3,
  "timeslot_interval": 1800,
  "is_ignore_schedule": true,
  "is_ignore_workhour": false
}
```

### Parameters

- start_day_identifier (필수): 검색을 시작할 날짜를 YYYYMMDD 형식으로 입력합니다.
- timezone_identifier (필수): 타임존 식별자 (예: "Asia/Seoul").
- service_duration (필수): 서비스의 지속 시간(초 단위).
  days (선택적, 기본값 1): 사용 가능한 시간대를 검색할 일 수.
- timeslot_interval (선택적, 기본값 1800): 시간대 간의 간격(초 단위).
- is_ignore_schedule: (선택적, 기본값 false): true로 설정하면 일정이 무시되고 모든 시간대가 사용 가능하다고 간주됩니다.
- is_ignore_workhour: (선택적, 기본값 false): true로 설정하면 근무 시간이 무시되고 전체 일에 대해 시간대가 생성됩니다.

### Response

Example response:

```json
[
  {
    "start_of_day": 1620518400,
    "day_modifier": 0,
    "is_day_off": false,
    "timeslots": [
      {
        "begin_at": 1620525600,
        "end_at": 1620529200
      },
      {
        "begin_at": 1620529200,
        "end_at": 1620532800
      }
    ]
  }
]
```

Running Tests
To run the test suite, simply execute the following command: npm test
