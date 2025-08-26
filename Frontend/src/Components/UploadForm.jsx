import React, { useEffect, useState } from "react";
import axios from "axios";

const UploadForm = () => {
  // const [error, setError] = useState("");
  const [uploadFile, setUploadFile] = useState("");
  const [chapters, setChapters] = useState(["ch1", "ch2"]);
  const [isLoading, setIsLoading] = useState(false);

  let axiosInstance = axios.create({
    baseURL: "http://localhost:5000",
  });

  console.log("chapters.toLocaleString()");


  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const formdata = new FormData();
        formdata.append("uploadFile", uploadFile);

        let response = await axiosInstance.post("/upload/", formdata);
        const { success, message, data } = response;

        setChapters(data.chapters);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData()
  }, [uploadFile]);

  async function handleSubmit(e) {
    e.preventDefault();
    setUploadFile(uploadFile)
    // const formdata = new FormData();
    // formdata.append("uploadFile", uploadFile);

    // const { success, message, data } = response;
    // let response = await axiosInstance.post("/upload/", formdata);

    // setChapters(data.chapters);
  }

  return (
    <form
      onSubmit={(e) => handleSubmit(e)}
      className="flex flex-col min-w-72 gap-4"
    >
      {isLoading && <p>loading...</p>}

      <ul>
        {chapters?.map((chapter) => {
          <li>{chapter}</li>;
        })}
      </ul>


      <label
        htmlFor="uploadFile"
        className="border text-center  rounded justify-center flex flex-col py-14 px-10 border-green-500"
      >
        {/* TODO: install lucide-react */}
        <div className="text-green-500 flex flex-col gap-4">
          {uploadFile ? (
            <div className=" gap-4">
              <p className="text-8xl font-extrabold">{/* <PlusIcon /> */}+</p>
              <p className="text block">{uploadFile.name}</p>
            </div>
          ) : (
            <div>
              <p className="text-8xl font-extrabold">{/* <PlusIcon /> */}+</p>
              <p className="text block">Drop your PDF file into the box or</p>
              <div className="my-4 border border-green-500 rounded  p-2 px-4">
                Select
              </div>
            </div>
          )}
        </div>

        <input
          type="file"
          name="uploadFile"
          hidden
          // multiple
          className="text-green-500"
          id="uploadFile"
          onChange={(e) => setUploadFile(e.target.files[0])}
        />
      </label>
      <button className="rounded bg-green-500 px-8 py-2 text-lg">Submit</button>
    </form>
  );
};

export default UploadForm;
