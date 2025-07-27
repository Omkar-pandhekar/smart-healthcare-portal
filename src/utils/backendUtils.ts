export const authenticator = async () => {
    try {
      const res = await fetch("/api/imagekit-auth",{method:"GET"});
      console.log(res);

      if (!res.ok) {
        throw new Error(`Failed to authenticate `);
      }
      return res.json();
    } catch (error) {
      throw error;
    }
  };