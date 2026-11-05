const stub = {
  readFile: (_path: string, cb: (error: Error | null, data?: Uint8Array) => void) => {
    cb(new Error("fs is not available in the browser"));
  },
};

export default stub;
