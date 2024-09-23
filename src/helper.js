export function safeJSONParse(paramString) {
  let param = {};
  try {
    if (paramString && paramString.length > 0) param = JSON.parse(paramString);
  } catch(error) {
    console.error('incompatible JSON string', error);
  }
  return param;
}


export function isAbsoluteURL(urlString) {
  return urlString.startsWith('http://') || urlString.startsWith('https://');
};
