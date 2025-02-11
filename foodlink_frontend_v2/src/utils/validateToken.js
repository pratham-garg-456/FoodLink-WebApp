import axios from 'axios';

const validateToken = async (token) => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/auth/profile`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    if (error.response) {
      return { error: error.response.data.detail };
    } else {
      return { error: `An error occurred ${error}` };
    }
  }
};

export default validateToken;
