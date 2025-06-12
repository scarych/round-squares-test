import dayjs from "dayjs";

import localizedFormat from "dayjs/plugin/localizedFormat";
import "dayjs/locale/ru";

dayjs.locale("ru");
dayjs.extend(localizedFormat);

export { dayjs };
