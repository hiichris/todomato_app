// Get the type of an object
export function getObjectType(obj: any) {
  if (obj === null) return "Null";
  if (obj === undefined) return "Undefined";
  if (typeof obj !== "object" && typeof obj !== "function") return typeof obj;

  if (obj.constructor) {
    const constructorName = obj.constructor.name;

    // Additional checks for Promise and AsyncGenerator
    if (constructorName === "Promise") {
      return "Promise";
    }

    if (constructorName === "AsyncGenerator") {
      return "AsyncGenerator";
    }

    // Inspect properties to find more specific information
    if (obj instanceof Promise) {
      // Here you might have to use custom logic depending on your application's use of Promises
      return "Promise (detailed inspection)";
    }

    if (typeof obj.next === "function" && typeof obj.throw === "function") {
      // Assuming it's an AsyncGenerator
      return "AsyncGenerator (detailed inspection)";
    }

    return constructorName;
  }

  return Object.prototype.toString.call(obj).slice(8, -1);
}
