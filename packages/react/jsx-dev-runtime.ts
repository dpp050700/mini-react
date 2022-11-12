/**
 * 这个文件是为了方便demos下的示例调试用的\
 * vite 启动的时候
 *
 *  var _jsxFileName = ".../react/mini-react/demos/v1/main.tsx";
    import React from "react";                    
    import ReactDOM from "react-dom";
    import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime"; 
    
    猜测：开发环境的时候 @vitejs/plugin-react  自动将 jsx 转为 jsxDEV 函数，而不是 createElement
 */

export { jsxDEV } from './src/ReactJSXElement'
