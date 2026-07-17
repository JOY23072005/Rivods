import axiosInstance from "../axios"

export const uploadImage = async (url, image) => {

  const formData = new FormData();
  formData.append("image", image);

  const res = await axiosInstance.patch(
    url,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  console.log(res.status,res.message);

  return res.data;
};