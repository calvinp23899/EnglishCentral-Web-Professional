import { createElement } from "react";
import { message } from "antd";
import { CircleX } from "lucide-react";

const DEFAULT_DANGER_MESSAGE = "Không thể kết nối tới server";

export const toastDanger = (content = DEFAULT_DANGER_MESSAGE) => {
  message.error({
    className: "ec-toast-danger",
    content,
    duration: 3.6,
    icon: createElement(CircleX, {
      "aria-hidden": true,
      size: 16,
      strokeWidth: 2.4,
    }),
  });
};
