import * as echarts from "echarts";

export default defineNuxtPlugin(() => {
  return {
    provide: {
      echarts,
    },
  };
});
