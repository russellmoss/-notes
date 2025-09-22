PS C:\Users\russe\notes-middleware> npx tsc --noEmit
src/__tests__/api/review/pending.test.ts:7:1 - error TS2708: Cannot use namespace 'jest' as a value.

7 jest.mock('@notionhq/client', () => ({
  ~~~~

src/__tests__/api/review/pending.test.ts:8:11 - error TS2708: Cannot use namespace 'jest' as a value.

8   Client: jest.fn().mockImplementation(() => mockNotionClient),
            ~~~~

src/__tests__/api/review/pending.test.ts:12:1 - error TS2708: Cannot use namespace 'jest' as a value.

12 jest.mock('@/lib/date-utils', () => ({
   ~~~~

src/__tests__/api/review/pending.test.ts:13:18 - error TS2708: Cannot use namespace 'jest' as a value.

13   getStartOfDay: jest.fn((date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())),
                    ~~~~

src/__tests__/api/review/pending.test.ts:13:27 - error TS7006: Parameter 'date' implicitly has an 'any' type.

13   getStartOfDay: jest.fn((date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())),
                             ~~~~

src/__tests__/api/review/pending.test.ts:14:16 - error TS2708: Cannot use namespace 'jest' as a value.

14   getEndOfDay: jest.fn((date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)),
                  ~~~~

src/__tests__/api/review/pending.test.ts:14:25 - error TS7006: Parameter 'date' implicitly has an 'any' type.

14   getEndOfDay: jest.fn((date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)),
                           ~~~~

src/__tests__/api/review/pending.test.ts:15:12 - error TS2708: Cannot use namespace 'jest' as a value.

15   addDays: jest.fn((date, days) => {
              ~~~~

src/__tests__/api/review/pending.test.ts:15:21 - error TS7006: Parameter 'date' implicitly has an 'any' type.

15   addDays: jest.fn((date, days) => {
                       ~~~~

src/__tests__/api/review/pending.test.ts:15:27 - error TS7006: Parameter 'days' implicitly has an 'any' type.

15   addDays: jest.fn((date, days) => {
                             ~~~~

src/__tests__/api/review/pending.test.ts:22:1 - error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.

22 describe('/api/review/pending', () => {
   ~~~~~~~~

src/__tests__/api/review/pending.test.ts:23:3 - error TS2304: Cannot find name 'beforeEach'.

23   beforeEach(() => {
     ~~~~~~~~~~

src/__tests__/api/review/pending.test.ts:24:5 - error TS2708: Cannot use namespace 'jest' as a value.

24     jest.clearAllMocks();
       ~~~~

src/__tests__/api/review/pending.test.ts:29:3 - error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.

29   it('should return pending reviews successfully', async () => {
     ~~

src/__tests__/api/review/pending.test.ts:80:32 - error TS2554: Expected 0 arguments, but got 1.

80     const response = await GET(request);
                                  ~~~~~~~

src/__tests__/api/review/pending.test.ts:83:5 - error TS2304: Cannot find name 'expect'.

83     expect(response.status).toBe(200);
       ~~~~~~

src/__tests__/api/review/pending.test.ts:84:5 - error TS2304: Cannot find name 'expect'.

84     expect(data.notes).toHaveLength(1);
       ~~~~~~

src/__tests__/api/review/pending.test.ts:85:5 - error TS2304: Cannot find name 'expect'.

85     expect(data.notes[0].title).toBe('Test Note Title');
       ~~~~~~

src/__tests__/api/review/pending.test.ts:86:5 - error TS2304: Cannot find name 'expect'.

86     expect(data.counts.nextDay).toBe(1);
       ~~~~~~

src/__tests__/api/review/pending.test.ts:87:5 - error TS2304: Cannot find name 'expect'.

87     expect(data.counts.weekLater).toBe(0);
       ~~~~~~

src/__tests__/api/review/pending.test.ts:90:3 - error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.

90   it('should handle no data source found', async () => {
     ~~

src/__tests__/api/review/pending.test.ts:96:32 - error TS2554: Expected 0 arguments, but got 1.

96     const response = await GET(request);
                                  ~~~~~~~

src/__tests__/api/review/pending.test.ts:99:5 - error TS2304: Cannot find name 'expect'.

99     expect(response.status).toBe(500);
       ~~~~~~

src/__tests__/api/review/pending.test.ts:100:5 - error TS2304: Cannot find name 'expect'.

100     expect(data.error).toBe('No data source found');
        ~~~~~~

src/__tests__/api/review/pending.test.ts:103:3 - error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.

103   it('should handle Notion API errors', async () => {
      ~~

src/__tests__/api/review/pending.test.ts:107:32 - error TS2554: Expected 0 arguments, but got 1.

107     const response = await GET(request);
                                   ~~~~~~~

src/__tests__/api/review/pending.test.ts:110:5 - error TS2304: Cannot find name 'expect'.

110     expect(response.status).toBe(500);
        ~~~~~~

src/__tests__/api/review/pending.test.ts:111:5 - error TS2304: Cannot find name 'expect'.

111     expect(data.error).toBe('Failed to fetch pending reviews');
        ~~~~~~

src/__tests__/api/review/pending.test.ts:114:3 - error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.

114   it('should return empty results when no notes need review', async () => {
      ~~

src/__tests__/api/review/pending.test.ts:125:32 - error TS2554: Expected 0 arguments, but got 1.

125     const response = await GET(request);
                                   ~~~~~~~

src/__tests__/api/review/pending.test.ts:128:5 - error TS2304: Cannot find name 'expect'.

128     expect(response.status).toBe(200);
        ~~~~~~

src/__tests__/api/review/pending.test.ts:129:5 - error TS2304: Cannot find name 'expect'.

129     expect(data.notes).toHaveLength(0);
        ~~~~~~

src/__tests__/api/review/pending.test.ts:130:5 - error TS2304: Cannot find name 'expect'.

130     expect(data.counts.nextDay).toBe(0);
        ~~~~~~

src/__tests__/api/review/pending.test.ts:131:5 - error TS2304: Cannot find name 'expect'.

131     expect(data.counts.weekLater).toBe(0);
        ~~~~~~

src/__tests__/dummy.test.ts:2:1 - error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.

2 describe('Test Setup', () => {
  ~~~~~~~~

src/__tests__/dummy.test.ts:3:3 - error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.

3   it('should have Jest configured correctly', () => {
    ~~

src/__tests__/dummy.test.ts:4:5 - error TS2304: Cannot find name 'expect'.

4     expect(true).toBe(true);
      ~~~~~~

src/__tests__/lib/date-utils.test.ts:10:1 - error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.

10 describe('date-utils', () => {
   ~~~~~~~~

src/__tests__/lib/date-utils.test.ts:13:3 - error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.

13   describe('getStartOfDay', () => {
     ~~~~~~~~

src/__tests__/lib/date-utils.test.ts:14:5 - error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.

14     it('should return start of day (00:00:00.000)', () => {
       ~~

src/__tests__/lib/date-utils.test.ts:16:7 - error TS2304: Cannot find name 'expect'.

16       expect(result.getHours()).toBe(0);
         ~~~~~~

src/__tests__/lib/date-utils.test.ts:17:7 - error TS2304: Cannot find name 'expect'.

17       expect(result.getMinutes()).toBe(0);
         ~~~~~~

src/__tests__/lib/date-utils.test.ts:18:7 - error TS2304: Cannot find name 'expect'.

18       expect(result.getSeconds()).toBe(0);
         ~~~~~~

src/__tests__/lib/date-utils.test.ts:19:7 - error TS2304: Cannot find name 'expect'.

19       expect(result.getMilliseconds()).toBe(0);
         ~~~~~~

src/__tests__/lib/date-utils.test.ts:22:5 - error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.

22     it('should preserve the date', () => {
       ~~

src/__tests__/lib/date-utils.test.ts:24:7 - error TS2304: Cannot find name 'expect'.

24       expect(result.getFullYear()).toBe(testDate.getFullYear());
         ~~~~~~

src/__tests__/lib/date-utils.test.ts:25:7 - error TS2304: Cannot find name 'expect'.

25       expect(result.getMonth()).toBe(testDate.getMonth());
         ~~~~~~

src/__tests__/lib/date-utils.test.ts:26:7 - error TS2304: Cannot find name 'expect'.

26       expect(result.getDate()).toBe(testDate.getDate());
         ~~~~~~

src/__tests__/lib/date-utils.test.ts:30:3 - error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.

30   describe('getEndOfDay', () => {
     ~~~~~~~~

src/__tests__/lib/date-utils.test.ts:31:5 - error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.

31     it('should return end of day (23:59:59.999)', () => {
       ~~

src/__tests__/lib/date-utils.test.ts:33:7 - error TS2304: Cannot find name 'expect'.

33       expect(result.getHours()).toBe(23);
         ~~~~~~

src/__tests__/lib/date-utils.test.ts:34:7 - error TS2304: Cannot find name 'expect'.

34       expect(result.getMinutes()).toBe(59);
         ~~~~~~

src/__tests__/lib/date-utils.test.ts:35:7 - error TS2304: Cannot find name 'expect'.

35       expect(result.getSeconds()).toBe(59);
         ~~~~~~

src/__tests__/lib/date-utils.test.ts:36:7 - error TS2304: Cannot find name 'expect'.

36       expect(result.getMilliseconds()).toBe(999);
         ~~~~~~

src/__tests__/lib/date-utils.test.ts:39:5 - error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.

39     it('should preserve the date', () => {
       ~~

src/__tests__/lib/date-utils.test.ts:41:7 - error TS2304: Cannot find name 'expect'.

41       expect(result.getFullYear()).toBe(testDate.getFullYear());
         ~~~~~~

src/__tests__/lib/date-utils.test.ts:42:7 - error TS2304: Cannot find name 'expect'.

42       expect(result.getMonth()).toBe(testDate.getMonth());
         ~~~~~~

src/__tests__/lib/date-utils.test.ts:43:7 - error TS2304: Cannot find name 'expect'.

43       expect(result.getDate()).toBe(testDate.getDate());
         ~~~~~~

src/__tests__/lib/date-utils.test.ts:47:3 - error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.

47   describe('addDays', () => {
     ~~~~~~~~

src/__tests__/lib/date-utils.test.ts:48:5 - error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.

48     it('should add positive days', () => {
       ~~

src/__tests__/lib/date-utils.test.ts:52:7 - error TS2304: Cannot find name 'expect'.

52       expect(result.getDate()).toBe(expected.getDate());
         ~~~~~~

src/__tests__/lib/date-utils.test.ts:55:5 - error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.

55     it('should subtract days with negative values', () => {
       ~~

src/__tests__/lib/date-utils.test.ts:59:7 - error TS2304: Cannot find name 'expect'.

59       expect(result.getDate()).toBe(expected.getDate());
         ~~~~~~

src/__tests__/lib/date-utils.test.ts:62:5 - error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.

62     it('should handle month boundaries', () => {
       ~~

src/__tests__/lib/date-utils.test.ts:65:7 - error TS2304: Cannot find name 'expect'.

65       expect(result.getMonth()).toBe(9); // October (0-indexed)
         ~~~~~~

src/__tests__/lib/date-utils.test.ts:66:7 - error TS2304: Cannot find name 'expect'.

66       expect(result.getDate()).toBe(1);
         ~~~~~~

src/__tests__/lib/date-utils.test.ts:70:3 - error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.

70   describe('isSameDay', () => {
     ~~~~~~~~

src/__tests__/lib/date-utils.test.ts:71:5 - error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.

71     it('should return true for same day', () => {
       ~~

src/__tests__/lib/date-utils.test.ts:73:7 - error TS2304: Cannot find name 'expect'.

73       expect(isSameDay(testDate, sameDay)).toBe(true);
         ~~~~~~

src/__tests__/lib/date-utils.test.ts:76:5 - error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.

76     it('should return false for different days', () => {
       ~~

src/__tests__/lib/date-utils.test.ts:78:7 - error TS2304: Cannot find name 'expect'.

78       expect(isSameDay(testDate, differentDay)).toBe(false);
         ~~~~~~

src/__tests__/lib/date-utils.test.ts:81:5 - error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.

81     it('should return false for different months', () => {
       ~~

src/__tests__/lib/date-utils.test.ts:83:7 - error TS2304: Cannot find name 'expect'.

83       expect(isSameDay(testDate, differentMonth)).toBe(false);
         ~~~~~~

src/__tests__/lib/date-utils.test.ts:86:5 - error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.

86     it('should return false for different years', () => {
       ~~

src/__tests__/lib/date-utils.test.ts:88:7 - error TS2304: Cannot find name 'expect'.

88       expect(isSameDay(testDate, differentYear)).toBe(false);
         ~~~~~~

src/__tests__/lib/date-utils.test.ts:92:3 - error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.

92   describe('getReviewDates', () => {
     ~~~~~~~~

src/__tests__/lib/date-utils.test.ts:93:5 - error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.

93     it('should calculate correct review dates', () => {
       ~~

src/__tests__/lib/date-utils.test.ts:99:7 - error TS2304: Cannot find name 'expect'.

99       expect(result.nextDayReview).toEqual(expectedNextDay);
         ~~~~~~

src/__tests__/lib/date-utils.test.ts:103:7 - error TS2304: Cannot find name 'expect'.

103       expect(result.weekLaterReview).toEqual(expectedWeekLater);
          ~~~~~~

src/__tests__/lib/date-utils.test.ts:106:5 - error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.

106     it('should handle month boundaries in review dates', () => {
        ~~

src/__tests__/lib/date-utils.test.ts:111:7 - error TS2304: Cannot find name 'expect'.

111       expect(result.nextDayReview.getMonth()).toBe(9); // October (0-indexed)
          ~~~~~~

src/__tests__/lib/date-utils.test.ts:112:7 - error TS2304: Cannot find name 'expect'.

112       expect(result.nextDayReview.getDate()).toBe(1);
          ~~~~~~

src/__tests__/lib/date-utils.test.ts:115:7 - error TS2304: Cannot find name 'expect'.

115       expect(result.weekLaterReview.getMonth()).toBe(9); // October (0-indexed)
          ~~~~~~

src/__tests__/lib/date-utils.test.ts:116:7 - error TS2304: Cannot find name 'expect'.

116       expect(result.weekLaterReview.getDate()).toBe(7);
          ~~~~~~

src/__tests__/setup.ts:12:1 - error TS2708: Cannot use namespace 'jest' as a value.

12 jest.mock('next/navigation', () => ({
   ~~~~

src/__tests__/setup.ts:14:11 - error TS2708: Cannot use namespace 'jest' as a value.

14     push: jest.fn(),
             ~~~~

src/__tests__/setup.ts:15:14 - error TS2708: Cannot use namespace 'jest' as a value.

15     replace: jest.fn(),
                ~~~~

src/__tests__/setup.ts:16:15 - error TS2708: Cannot use namespace 'jest' as a value.

16     prefetch: jest.fn(),
                 ~~~~

src/__tests__/setup.ts:17:11 - error TS2708: Cannot use namespace 'jest' as a value.

17     back: jest.fn(),
             ~~~~

src/__tests__/setup.ts:18:14 - error TS2708: Cannot use namespace 'jest' as a value.

18     forward: jest.fn(),
                ~~~~

src/__tests__/setup.ts:19:14 - error TS2708: Cannot use namespace 'jest' as a value.

19     refresh: jest.fn(),
                ~~~~

src/__tests__/setup.ts:22:10 - error TS2708: Cannot use namespace 'jest' as a value.

22     get: jest.fn(),
            ~~~~

src/__tests__/setup.ts:28:1 - error TS2708: Cannot use namespace 'jest' as a value.

28 jest.mock('@/lib/supabase', () => ({
   ~~~~

src/__tests__/setup.ts:31:19 - error TS2708: Cannot use namespace 'jest' as a value.

31       getSession: jest.fn(),
                     ~~~~

src/__tests__/setup.ts:32:27 - error TS2708: Cannot use namespace 'jest' as a value.

32       signInWithPassword: jest.fn(),
                             ~~~~

src/__tests__/setup.ts:33:16 - error TS2708: Cannot use namespace 'jest' as a value.

33       signOut: jest.fn(),
                  ~~~~

src/__tests__/setup.ts:39:22 - error TS2708: Cannot use namespace 'jest' as a value.

39         getUserById: jest.fn(),
                        ~~~~

src/__tests__/setup.ts:46:1 - error TS2708: Cannot use namespace 'jest' as a value.

46 jest.mock('@notionhq/client', () => ({
   ~~~~

src/__tests__/setup.ts:47:11 - error TS2708: Cannot use namespace 'jest' as a value.

47   Client: jest.fn().mockImplementation(() => ({
             ~~~~

src/__tests__/setup.ts:49:17 - error TS2708: Cannot use namespace 'jest' as a value.

49       retrieve: jest.fn(),
                   ~~~~

src/__tests__/setup.ts:50:14 - error TS2708: Cannot use namespace 'jest' as a value.

50       query: jest.fn(),
                ~~~~

src/__tests__/setup.ts:51:15 - error TS2708: Cannot use namespace 'jest' as a value.

51       create: jest.fn(),
                 ~~~~

src/__tests__/setup.ts:52:15 - error TS2708: Cannot use namespace 'jest' as a value.

52       update: jest.fn(),
                 ~~~~

src/__tests__/setup.ts:55:15 - error TS2708: Cannot use namespace 'jest' as a value.

55       create: jest.fn(),
                 ~~~~

src/__tests__/setup.ts:56:15 - error TS2708: Cannot use namespace 'jest' as a value.

56       update: jest.fn(),
                 ~~~~

src/__tests__/setup.ts:57:17 - error TS2708: Cannot use namespace 'jest' as a value.

57       retrieve: jest.fn(),
                   ~~~~

src/__tests__/setup.ts:60:14 - error TS2708: Cannot use namespace 'jest' as a value.

60       query: jest.fn(),
                ~~~~

src/__tests__/setup.ts:66:1 - error TS2708: Cannot use namespace 'jest' as a value.

66 jest.mock('openai', () => ({
   ~~~~

src/__tests__/setup.ts:67:11 - error TS2708: Cannot use namespace 'jest' as a value.

67   OpenAI: jest.fn().mockImplementation(() => ({
             ~~~~

src/__tests__/setup.ts:70:17 - error TS2708: Cannot use namespace 'jest' as a value.

70         create: jest.fn(),
                   ~~~~

src/__tests__/setup.ts:77:16 - error TS2708: Cannot use namespace 'jest' as a value.

77 global.fetch = jest.fn();
                  ~~~~

src/__tests__/setup.ts:80:1 - error TS2304: Cannot find name 'afterEach'.

80 afterEach(() => {
   ~~~~~~~~~

src/__tests__/setup.ts:81:3 - error TS2708: Cannot use namespace 'jest' as a value.

81   jest.clearAllMocks();
     ~~~~

src/__tests__/utils/mocks.ts:6:15 - error TS2708: Cannot use namespace 'jest' as a value.

6     retrieve: jest.fn(),
                ~~~~

src/__tests__/utils/mocks.ts:7:12 - error TS2708: Cannot use namespace 'jest' as a value.

7     query: jest.fn(),
             ~~~~

src/__tests__/utils/mocks.ts:8:13 - error TS2708: Cannot use namespace 'jest' as a value.

8     create: jest.fn(),
              ~~~~

src/__tests__/utils/mocks.ts:9:13 - error TS2708: Cannot use namespace 'jest' as a value.

9     update: jest.fn(),
              ~~~~

src/__tests__/utils/mocks.ts:12:13 - error TS2708: Cannot use namespace 'jest' as a value.

12     create: jest.fn(),
               ~~~~

src/__tests__/utils/mocks.ts:13:13 - error TS2708: Cannot use namespace 'jest' as a value.

13     update: jest.fn(),
               ~~~~

src/__tests__/utils/mocks.ts:14:15 - error TS2708: Cannot use namespace 'jest' as a value.

14     retrieve: jest.fn(),
                 ~~~~

src/__tests__/utils/mocks.ts:17:12 - error TS2708: Cannot use namespace 'jest' as a value.

17     query: jest.fn(),
              ~~~~

src/__tests__/utils/mocks.ts:19:11 - error TS2694: Namespace 'global.jest' has no exported member 'Mocked'.

19 } as jest.Mocked<Client>;
             ~~~~~~

src/__tests__/utils/mocks.ts:23:17 - error TS2708: Cannot use namespace 'jest' as a value.

23     getSession: jest.fn(),
                   ~~~~

src/__tests__/utils/mocks.ts:24:25 - error TS2708: Cannot use namespace 'jest' as a value.

24     signInWithPassword: jest.fn(),
                           ~~~~

src/__tests__/utils/mocks.ts:25:14 - error TS2708: Cannot use namespace 'jest' as a value.

25     signOut: jest.fn(),
                ~~~~

src/__tests__/utils/mocks.ts:26:14 - error TS2708: Cannot use namespace 'jest' as a value.

26     getUser: jest.fn(),
                ~~~~

src/__tests__/utils/mocks.ts:28:9 - error TS2708: Cannot use namespace 'jest' as a value.

28   from: jest.fn(),
           ~~~~

src/__tests__/utils/mocks.ts:34:15 - error TS2708: Cannot use namespace 'jest' as a value.

34       create: jest.fn(),
                 ~~~~

src/__tests__/utils/mocks.ts:136:25 - error TS2694: Namespace 'global.jest' has no exported member 'Mock'.

136   (global.fetch as jest.Mock).mockResolvedValue(createMockFetchResponse(data));
                            ~~~~

src/__tests__/utils/mocks.ts:141:25 - error TS2694: Namespace 'global.jest' has no exported member 'Mock'.

141   (global.fetch as jest.Mock).mockResolvedValue(createMockFetchResponse({ error }, false));
                            ~~~~

src/app/api/review/pending/route.ts:122:37 - error TS7006: Parameter 'p' implicitly has an 'any' type.

122       ...nextDayReviews.results.map(p => formatNote(p, 'next-day')),
                                        ~

src/app/api/review/pending/route.ts:123:39 - error TS7006: Parameter 'p' implicitly has an 'any' type.

123       ...weekLaterReviews.results.map(p => formatNote(p, 'week-later'))
                                          ~

src/app/chat/page.tsx:167:13 - error TS2322: Type 'void' is not assignable to type 'ReactNode'.

167             {console.log('🎨 Rendering conversations:', conversations.length, conversations)}
                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/lib/email.ts:1:24 - error TS7016: Could not find a declaration file for module 'nodemailer'. 'C:/Users/russe/notes-middleware/node_modules/nodemailer/lib/nodemailer.js' implicitly has an 'any' type.
  Try `npm i --save-dev @types/nodemailer` if it exists or add a new declaration (.d.ts) file containing `declare module 'nodemailer';`

1 import nodemailer from 'nodemailer';
                         ~~~~~~~~~~~~

src/lib/notion.ts:169:5 - error TS2322: Type 'NotionPageProperties' is not assignable to type 'Record<string, { title: RichTextItemRequest[]; type?: "title" | undefined; } | { rich_text: RichTextItemRequest[]; type?: "rich_text" | undefined; } | ... 11 more ... | { ...; }>'.
  Index signature for type 'string' is missing in type 'NotionPageProperties'.

169     properties: props,
        ~~~~~~~~~~

  node_modules/@notionhq/client/build/src/api-endpoints.d.ts:2686:5
    2686     properties?: Record<string, {
             ~~~~~~~~~~
    The expected type comes from property 'properties' which is declared here on type 'WithAuth<CreatePageBodyParameters>'


Found 135 errors in 9 files.

Errors  Files
    34  src/__tests__/api/review/pending.test.ts:7
     3  src/__tests__/dummy.test.ts:2
    47  src/__tests__/lib/date-utils.test.ts:10
    29  src/__tests__/setup.ts:12
    17  src/__tests__/utils/mocks.ts:6
     2  src/app/api/review/pending/route.ts:122
     1  src/app/chat/page.tsx:167
     1  src/lib/email.ts:1
     1  src/lib/notion.ts:169
PS C:\Users\russe\notes-middleware> npm install --save-dev @types/jest @types/nodemailer

added 83 packages, and audited 888 packages in 5s

220 packages are looking for funding
  run `npm fund` for details

1 critical severity vulnerability

To address all issues, run:
  npm audit fix --force

Run `npm audit` for details.
PS C:\Users\russe\notes-middleware> npx tsc --noEmit
src/__tests__/api/review/pending.test.ts:31:41 - error TS2339: Property 'mockResolvedValue' does not exist on type '(args: WithAuth<GetDatabasePathParameters>) => Promise<GetDatabaseResponse>'.

31     mockNotionClient.databases.retrieve.mockResolvedValue({
                                           ~~~~~~~~~~~~~~~~~

src/__tests__/api/review/pending.test.ts:76:8 - error TS2339: Property 'mockResolvedValueOnce' does not exist on type '(args: WithAuth<QueryDataSourceParameters>) => Promise<QueryDataSourceResponse>'.

76       .mockResolvedValueOnce({ results: [mockNote] } as any) // First call for next-day reviews
          ~~~~~~~~~~~~~~~~~~~~~

src/__tests__/api/review/pending.test.ts:80:32 - error TS2554: Expected 0 arguments, but got 1.

80     const response = await GET(request);
                                  ~~~~~~~

src/__tests__/api/review/pending.test.ts:91:41 - error TS2339: Property 'mockResolvedValue' does not exist on type '(args: WithAuth<GetDatabasePathParameters>) => Promise<GetDatabaseResponse>'.

91     mockNotionClient.databases.retrieve.mockResolvedValue({
                                           ~~~~~~~~~~~~~~~~~

src/__tests__/api/review/pending.test.ts:96:32 - error TS2554: Expected 0 arguments, but got 1.

96     const response = await GET(request);
                                  ~~~~~~~

src/__tests__/api/review/pending.test.ts:104:41 - error TS2339: Property 'mockRejectedValue' does not exist on type '(args: WithAuth<GetDatabasePathParameters>) => Promise<GetDatabaseResponse>'.

104     mockNotionClient.databases.retrieve.mockRejectedValue(new Error('Notion API Error'));
                                            ~~~~~~~~~~~~~~~~~

src/__tests__/api/review/pending.test.ts:107:32 - error TS2554: Expected 0 arguments, but got 1.

107     const response = await GET(request);
                                   ~~~~~~~

src/__tests__/api/review/pending.test.ts:115:41 - error TS2339: Property 'mockResolvedValue' does not exist on type '(args: WithAuth<GetDatabasePathParameters>) => Promise<GetDatabaseResponse>'.

115     mockNotionClient.databases.retrieve.mockResolvedValue({
                                            ~~~~~~~~~~~~~~~~~

src/__tests__/api/review/pending.test.ts:121:8 - error TS2339: Property 'mockResolvedValueOnce' does not exist on type '(args: WithAuth<QueryDataSourceParameters>) => Promise<QueryDataSourceResponse>'.

121       .mockResolvedValueOnce({ results: [] } as any) // First call for next-day reviews
           ~~~~~~~~~~~~~~~~~~~~~

src/__tests__/api/review/pending.test.ts:125:32 - error TS2554: Expected 0 arguments, but got 1.

125     const response = await GET(request);
                                   ~~~~~~~

src/__tests__/utils/mocks.ts:4:33 - error TS2352: Conversion of type '{ databases: { retrieve: jest.Mock<any, any, any>; query: jest.Mock<any, any, any>; create: jest.Mock<any, any, any>; update: jest.Mock<any, any, any>; }; pages: { ...; }; dataSources: { ...; }; }' to type 'Mocked<Client>' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Type '{ databases: { retrieve: Mock<any, any, any>; query: Mock<any, any, any>; create: Mock<any, any, any>; update: Mock<any, any, any>; }; pages: { create: Mock<any, any, any>; update: Mock<...>; retrieve: Mock<...>; }; dataSources: { ...; }; }' is missing the following properties from type '{ request: MockInstance<Promise<object>, [args: RequestParameters], unknown>; readonly blocks: { retrieve: (args: WithAuth<GetBlockPathParameters>) => Promise<...>; update: (args: WithAuth<...>) => Promise<...>; delete: (args: WithAuth<...>) => Promise<...>; children: { ...; }; }; ... 7 more ...; readonly oauth: { ....': request, blocks, users, comments, and 3 more.

  4 export const mockNotionClient = {
                                    ~
  5   databases: {
    ~~~~~~~~~~~~~~
...
 18   },
    ~~~~
 19 } as jest.Mocked<Client>;
    ~~~~~~~~~~~~~~~~~~~~~~~~


Found 11 errors in 2 files.

Errors  Files
    10  src/__tests__/api/review/pending.test.ts:31
     1  src/__tests__/utils/mocks.ts:4
PS C:\Users\russe\notes-middleware>