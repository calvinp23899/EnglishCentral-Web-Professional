import { createElement } from "react";
import { message } from "antd";
import { CircleAlert, CircleCheck, CircleX, Info } from "lucide-react";

const DEFAULT_SUCCESS_MESSAGE = "Thao tác thành công";
const DEFAULT_DANGER_MESSAGE = "Không thể kết nối tới server";
const DEFAULT_WARNING_MESSAGE = "Vui lòng kiểm tra lại thông tin";
const DEFAULT_INFO_MESSAGE = "Thông tin đã được cập nhật";

type ToastVariant = "success" | "danger" | "warning" | "info";

const toastIconByVariant = {
  danger: CircleX,
  info: Info,
  success: CircleCheck,
  warning: CircleAlert,
} satisfies Record<ToastVariant, typeof CircleX>;

const messageTypeByVariant = {
  danger: "error",
  info: "info",
  success: "success",
  warning: "warning",
} satisfies Record<ToastVariant, "error" | "info" | "success" | "warning">;

const showToast = (variant: ToastVariant, content: string) => {
  const Icon = toastIconByVariant[variant];

  message[messageTypeByVariant[variant]]({
    className: `ec-toast ec-toast-${variant}`,
    content,
    duration: 3.6,
    icon: createElement(Icon, {
      "aria-hidden": true,
      size: 16,
      strokeWidth: 2.4,
    }),
  });
};

export const toastSuccess = (content = DEFAULT_SUCCESS_MESSAGE) => {
  showToast("success", content);
};

export const toastDanger = (content = DEFAULT_DANGER_MESSAGE) => {
  showToast("danger", content);
};

export const toastWarning = (content = DEFAULT_WARNING_MESSAGE) => {
  showToast("warning", content);
};

export const toastInfo = (content = DEFAULT_INFO_MESSAGE) => {
  showToast("info", content);
};
