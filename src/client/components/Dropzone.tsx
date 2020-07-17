import * as React from "react";
import { useState, useEffect } from "react";
import axios, { AxiosRequestConfig } from "axios";
import { ResponseInterface } from "../../common/ResponseInterface";

export default function Dropzone() {
  const validTypes = ["text/xml"];
  const disabled = false;
  const [hightlight, setHiglight] = useState<boolean>(false);
  const [files, setFiles] = useState<File[]>([]);
  const [filesWithoutDuplicates, setFilesWithoutDuplicates] = useState<File[]>(
    []
  );
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const fileInputRef = React.useRef(null);
  const openFileDialog = () => {
    fileInputRef.current.click();
  };
  const onFilesAddedByClick = evt => {
    const files: File[] = evt.target.files;
    handleFiles(files);
  };
  const onDragOver = evt => {
    evt.preventDefault();
    setHiglight(true);
  };
  const onDragLeave = e => {
    e.preventDefault();
    setHiglight(false);
  };
  const onDragEnter = e => {
    e.preventDefault();
  };
  const onDrop = e => {
    e.preventDefault();
    setHiglight(false);
    const files = e.dataTransfer.files;
    handleFiles(files);
  };
  const handleFiles = files => {
    const validateFile = file => {
      if (validTypes.indexOf(file.type) === -1) {
        return { isError: true, message: "Не тот тип файла. Нужен .xml" };
      }
      return { isError: false, message: null };
    };
    for (let i = 0; i < files.length; i++) {
      if (!validateFile(files[i]).isError) {
        setFiles(prevArray => [...prevArray, files[i]]);
      }
    }    
  };  
  const fileSize = size => {
    if (size === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Байт", "КБ", "МБ", "ГБ", "ТБ"];
    const i = Math.floor(Math.log(size) / Math.log(k));
    return parseFloat((size / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };
  useEffect(() => {
    let filteredArray = files.reduce((file, current) => {
      const x = file.find(item => item.name === current.name);
      if (!x) {
        return file.concat([current]);
      } else {
        return file;
      }
    }, []);
    setFilesWithoutDuplicates([...filteredArray]);
  }, [files]);
  const removeFile = name => {
    setFiles([...files.filter(file => file.name !== name)]);
  };
  const uploadFiles = async () => {
    setIsUploading(true);
    const configUpload: AxiosRequestConfig = {
      responseType: "arraybuffer",
      onUploadProgress: function(progressEvent) {
        // var percentCompleted = Math.round(
        //   (progressEvent.loaded * 100) / progressEvent.total
        // );
      },
    };
    const sendFile = file => {
      return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append("file", file);
        axios
          .post<ResponseInterface>("/api/upload", {formData})
          .then(res => {
            if (res.data.error) {
              if ((res.data.message === "XsdValidationError"))
                setErrorMessage("Это не акт сдачи-приемки");
              else setErrorMessage(res.data.message);
            } else {
              axios
                .post<Blob>(
                  "/api/download",
                  { filename: res.data.message },
                  configUpload
                )
                .then(res => {
                  const url = window.URL.createObjectURL(
                    new Blob([res.data], { type: "application/pdf" })
                  );
                  const link = document.createElement("a");
                  link.href = url;
                  link.setAttribute("download", "file.pdf"); //or any other extension
                  document.body.appendChild(link);
                  link.click();
                  resolve();
                });
            }
          })
          // .catch(() => {
          //   console.warn("Upload error on file", file.name);
          // });
      });
    } 
    const promises = [];
    for (let i = 0; i < filesWithoutDuplicates.length; i++) {
      promises.push(sendFile(filesWithoutDuplicates[i]));
    }
    try {
      await Promise.all(promises);
      setIsUploading(false);
      setFiles([]);
    } catch (e) {
      // console.warn("Upload error", e.message );
    }
  };
  return (
    <div className="dropzone">
      {isUploading ? (
        <div>
          {errorMessage !== "" ? (
            <span>
              {errorMessage}. Попробуйте <a href="/">загрузить</a> другой файл.
            </span>
          ) : (
            <span>Идет загрузка...</span>
          )}
        </div>
      ) : (
        <>
          <div
            onClick={openFileDialog}
            onDragEnter={onDragEnter}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`dropzone__container ${
              hightlight ? "dropzone__hightlight" : ""
            }`}
            style={{ cursor: "pointer" }}
          >
            <img
              alt="upload"
              className="dropzone__icon"
              src="images/cloud_upload.svg"
            />
            <input
              ref={fileInputRef}
              className="dropzone__fileinput"
              type="file"
              multiple
              onChange={onFilesAddedByClick}
              accept={validTypes.join(",")}
            />
            <span>Кликните сюда или переместите XML файлы на это поле</span>
          </div>
          <div className="files">
            {filesWithoutDuplicates.map(file => (
              <div className="file" key={file.name + file.size}>
                <div>
                  <span className="file__name">{file.name}</span>
                  <span className="file__size">{fileSize(file.size)}</span>{" "}
                </div>
                <div
                  className="file__remove"
                  onClick={() => removeFile(file.name)}
                >
                  X
                </div>
              </div>
            ))}
          </div>
          {filesWithoutDuplicates.length > 0 && (
            <button id="submit"className="button button--hero" onClick={uploadFiles}>
              Получить PDF
            </button>
          )}
        </>
      )}
    </div>
  );
}
