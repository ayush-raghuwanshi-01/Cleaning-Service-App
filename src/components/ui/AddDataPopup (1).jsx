import { useState, useRef, useEffect } from "react";
import { FaDatabase, FaFileExcel, FaFilePdf } from "react-icons/fa";
import "../../../CoustomCss/LoadingButton.css";
import { BiData } from "react-icons/bi";
import "../../../CoustomCss/Scrollbar.css";
import { HiOutlineDatabase, HiArrowNarrowRight } from "react-icons/hi";
import { FiSettings } from "react-icons/fi";
import { SiMysql } from "react-icons/si";
import File from "../../../assets/icons/file.png";
import clsx from "clsx";

import { IoEye } from "react-icons/io5";
import { MdDeleteForever } from "react-icons/md";

import { uploadFilesAPI, cleanFile, cancel_clean_file } from "../../../Api";
import Swal from "sweetalert2";
import PopupForm from "../PopupForm/PopupForm";
import { MenuItem } from "@mui/material";
import DbDataPreviewPopup from "../PopupForm/DbDataPreviewPopup";
import CustomNotificationCard from "../../Cards/CustomNotificationCard";
import ConfirmCleanModal from "../../Cards/ConfirmCleanModal";
import { CheckCircle, Loader2 } from "lucide-react";
import excel from "../../../assets/excel.svg";

const steps = [
  "Execution is in Progress",
  "Collecting data",
  "Cleaning data",
  "Storing data",
];

const mockFiles = [
  {
    name: "Coffee_Sales.csv",
    type: "excel",
  },
  {
    name: "Bitcoin_Whitepaper.pdf",
    type: "pdf",
  },
];

const AddDataPopup = ({ setByDataPreview }) => {
  const [isLoading, setIsLoading] = useState();
  const [isCleaning, setIsCleaning] = useState();
  const [activeTab, setActiveTab] = useState("static");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [fileCleaning, setFileCleaning] = useState();
  const [responseData, setResponseData] = useState(null);
  const [showEyeHint, setShowEyeHint] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const [DbResponse, setDbResponse] = useState(() => {
    const stored = sessionStorage.getItem("DbResponse");
    return stored ? JSON.parse(stored) : {};
  });
  const [dbType, setDbType] = useState(() => {
    const stored = sessionStorage.getItem("DbType");
    return stored ? JSON.parse(stored) : {};
  });

  const [tablePreview, setTablePreview] = useState(() => {
    const stored = localStorage.getItem("tablePreview");
    return stored ? JSON.parse(stored) : {};
  });

  const [uploadedFiles, setUploadedFiles] = useState(() => {
    const stored = localStorage.getItem("uploadedFile");
    return stored ? JSON.parse(stored) : [];
  });

  const [cleaningSummary, setCleaningSummary] = useState(null);

  const fileInputRef = useRef(null);
  const [isDataPreviewPopupOpen, setIsDataPreviewPopupOpen] = useState(false);
  const [card, setCard] = useState();
  const DataProcessingLoader = () => {
    const dynamicSteps = fileCleaning
      ? steps
      : steps.filter((step) => step !== "Cleaning data");
    const [currentStep, setCurrentStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState([]);

    useEffect(() => {
      if (currentStep < dynamicSteps.length) {
        const timer = setTimeout(() => {
          setCompletedSteps((prev) => [...prev, currentStep]);
          setCurrentStep((prev) => prev + 1);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }, [currentStep, dynamicSteps.length]);

    const allStepsDone = completedSteps.length === dynamicSteps.length;

    return (
      <div className="w-full max-w-md mx-auto mt-16 p-8 bg-gradient-to-br from-white to-indigo-50 shadow-2xl rounded-3xl border border-indigo-200">
        <h2 className="text-2xl font-bold text-center text-indigo-700 tracking-wide mb-6">
          Data Processing
        </h2>

        <div className="flex flex-col gap-10 relative px-4">
          {dynamicSteps.map((step, index) => {
            const isCurrent = currentStep === index;
            const isCompleted = completedSteps.includes(index);
            const isLast = index === dynamicSteps.length - 1;

            return (
              <div key={index} className="relative flex items-center gap-5">
                {/* Connector */}
                {!isLast && (
                  <span className="absolute left-3 top-6 w-px h-10 bg-gradient-to-b from-indigo-200 to-indigo-500 z-0" />
                )}

                {/* Icon */}
                <div className="z-10">
                  {isCompleted ? (
                    <CheckCircle
                      className="text-green-500 drop-shadow-md"
                      size={26}
                    />
                  ) : isCurrent ? (
                    <div className="relative flex items-center justify-center">
                      <span className="absolute w-7 h-7 bg-indigo-100 rounded-full animate-ping" />
                      <Loader2
                        className="text-indigo-500 animate-spin"
                        size={24}
                      />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-gray-300 shadow-inner" />
                  )}
                </div>

                {/* Step Text */}
                <p
                  className={clsx(
                    "text-base font-medium transition-all duration-300",
                    isCompleted
                      ? "text-green-700"
                      : isCurrent
                      ? "text-indigo-700 font-semibold"
                      : "text-gray-500"
                  )}
                >
                  {step}
                </p>
              </div>
            );
          })}
        </div>

        {allStepsDone && (
          <div className="mt-8 text-center">
            <p className="text-md text-indigo-600 animate-pulse font-semibold">
              Finishing up... please wait
            </p>
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    setShowEyeHint(true);
    const timeout = setTimeout(() => setShowEyeHint(false), 4000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    sessionStorage.setItem("DbResponse", JSON.stringify(DbResponse));
  }, [DbResponse]);

  useEffect(() => {
    sessionStorage.setItem("DbType", JSON.stringify(dbType));
  }, [dbType]);

  useEffect(() => {
    localStorage.setItem("tablePreview", JSON.stringify(tablePreview));
  }, [tablePreview]);

  useEffect(() => {
    localStorage.setItem("uploadedFile", JSON.stringify(uploadedFiles));
  }, [uploadedFiles]);

  const ShowAlert = () => {
    if (!responseData?.files[0]?.table_name) {
      console.error("Invalid responseData:", responseData);
      Swal.fire("Error", "Invalid table data. Please try again.", "error");
      return;
    }

    setShowModal(true);
  };

  const handleConfirm = async () => {
    setFileCleaning(true);
    setIsCleaning(true);
    setShowModal(false);
    try {
      queueMicrotask(() => setIsCleaning(true));
      const cleanTableResponse = await cleanFile(
        responseData.files[0].table_name
      );
      setIsCleaning(false);
      if (cleanTableResponse.status === "cleaned") {
        setShowNotification(true);
        setCard("clean");
        storeFilePreviews(cleanTableResponse);
        setUploadedFiles((prev) => [
          ...prev,
          {
            name: responseData.files[0].table_name,
            createdDate: new Date().toISOString().split("T")[0],
          },
        ]);
      } else {
        setSelectedFiles([]);
        throw new Error(cleanTableResponse.message || "Cleaning File failed");
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error", error.message, "error");
    } finally {
      setIsCleaning(false);
      setShowModal(false);
    }
  };

  const handleCancel = async () => {
    setIsCleaning(true);
    setFileCleaning(false);
    setShowModal(false);
    try {
      queueMicrotask(() => setIsCleaning(true));
      const cancelResponse = await cancel_clean_file(
        responseData.files[0].table_name
      );
      setIsCleaning(false);
      if (cancelResponse.status === "saved raw") {
        storeFilePreviews(cancelResponse);
        setUploadedFiles((prev) => [
          ...prev,
          {
            name: responseData.files[0].table_name,
            createdDate: new Date().toISOString().split("T")[0],
          },
        ]);
        setShowNotification(true);
        setCard("cancel");
      } else {
        setSelectedFiles([]);
        throw new Error(cancelResponse.message || "Cancellation failed");
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error", error.message, "error");
    } finally {
      setIsCleaning(false);
      setShowModal(false);
    }
  };

  useEffect(() => {
    if (cleaningSummary) {
      ShowAlert();
    }
  }, [cleaningSummary]);

  const storeFilePreviews = (data) => {
    setTablePreview((prev) => ({
      ...prev,
      [data.table_name]: data.preview,
    }));
  };
  const handleRemoveFile = (indexToRemove) => {
    const fileToRemove = uploadedFiles[indexToRemove].name;

    Swal.fire({
      title: '<span class="text-2xl text-gray-900">Are you sure?</span>',
      html: '<span class="text-message text-gray-700">You won\'t be able to revert this!</span>',
      icon: "warning",
      showCancelButton: true,
      width: "30vw",
      height: "30vh",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, remove it!",
      customClass: {
        popup: "rounded-lg p-4",
        confirmButton: "text-label bg-blue-600 text-white hover:bg-blue-700",
        cancelButton: "text-label bg-red-500 text-white hover:bg-red-600",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        setUploadedFiles((prevFiles) =>
          prevFiles.filter((_, index) => index !== indexToRemove)
        );

        setSelectedFiles((prevFiles) =>
          prevFiles.filter((_, index) => index !== indexToRemove)
        );

        setTablePreview((prevPreview) => {
          if (!prevPreview || typeof prevPreview !== "object") {
            return {};
          }
          const updatedPreview = { ...prevPreview };
          delete updatedPreview[fileToRemove];
          return updatedPreview;
        });
      }
    });
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files || event.dataTransfer.files);
    const newFiles = files.filter(
      (file) =>
        !uploadedFiles.some((fileObj) => fileObj.name === file.name) &&
        !selectedFiles.some((selected) => selected.name === file.name)
    );

    if (newFiles.length === 0) {
      setErrorMessage("Duplicate files are not allowed.");
      return;
    }

    setSelectedFiles((prevFiles) => [...prevFiles, ...newFiles]);
    queueMicrotask(() => {
      setIsLoading(true);
    });

    try {
      const data = await uploadFilesAPI(newFiles);

      const matchingFile = uploadedFiles.find((file) =>
        data.files.some(
          (responseFile) =>
            responseFile.table_name.toLowerCase() === file.name.toLowerCase()
        )
      );

      if (matchingFile) {
        Swal.fire({
          title: "Duplicate File",
          text: "This file has already been uploaded",
          icon: "warning",
          confirmButtonText: "OK",
        });
        return;
      }
      setResponseData(data);
      setTablePreview((prevPreview) => ({
        ...prevPreview,
        ...data,
      }));
      setSelectedFiles([]);
      if (data.files.length !== newFiles.length) {
        setErrorMessage("Some files were not uploaded successfully");
      }
    } catch (error) {
      setSelectedFiles([]);
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  const getPreviewByFileName = (fileName) => {
    const previewData = tablePreview[fileName] || [];

    if (previewData.length === 0) {
      Swal.fire({
        icon: "error",
        title: "No Preview Available",
        text: `No preview data found for ${fileName}.`,
        confirmButtonText: "OK",
        customClass: {
          popup: "rounded-xl",
          confirmButton: "bg-blue-600 hover:bg-blue-700 rounded-lg px-4 py-2",
        },
      });
      return;
    }

    const columnCount = Object.keys(previewData[0]).length;
    const minWidthPerColumnVW = 1;
    let modalWidth = columnCount * minWidthPerColumnVW;

    modalWidth = Math.max(modalWidth, 40);
    modalWidth = Math.min(modalWidth, 50);
    const modalHeight = "calc(100vh - 80px)";

    const tableHtml = `
      <style>
        .swal2-popup {
          margin: 0;
          position: fixed !important;
          top: 0px;
          right: 0px;
          left: auto;
          transform: none !important;
          padding: 0;
        }
        .custom-header {
          display: flex;
          align-items: start;
          background: #fff;
          padding: 16px 20px 12px 20px;
          border-bottom: 1px solid #ddd;
          position: relative;
        }
        .custom-header .close-icon {
          font-size: 20px;
          color: #555;
          cursor: pointer;
          margin-right: 16px;
        }
        .custom-header .close-icon:hover {
          color: #2d1b54;
        }
        .custom-header .title {
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .custom-header .flex-grow {
          flex-grow: 1;
        }
        .custom-header .stats {
          margin-top: 4px;
          font-size: 14px;
          color: #6b7280;
          font-weight: 500;
          white-space: nowrap;
        }
      </style>
  
      <div class="custom-header">
        <div id="custom-close-icon" class="close-icon">&#10005;</div>
        <div class="title">Data preview</div>
        <div class="flex-grow"></div>
        <div class="stats">Total Rows = ${
          previewData.length
        } , Total Columns =  ${columnCount}</div>
      </div>
  
      <div class="scrollbar-xy rounded-xl bg-[#f3f4fb] overflow-auto" style="height:${modalHeight};">
        <table class="border-collapse text-sm font-sans w-max min-w-full">
          <thead class="sticky top-0 z-10">
            <tr>
              ${Object.keys(previewData[0])
                .map(
                  (key) => `
                  <th class="bg-gray-400 text-gray-800 font-semibold text-left capitalize border border-gray-300 px-4 py-3 min-w-[150px] whitespace-nowrap">
                    <i class="fa fa-tag mr-1"></i>${key}
                  </th>`
                )
                .join("")}
            </tr>
          </thead>
          <tbody>
            ${previewData
              .map(
                (row, rowIndex) => `
                <tr class="${
                  rowIndex % 2 === 0 ? "bg-[#f9fafb]" : "bg-white"
                } hover:bg-indigo-100">
                  ${Object.values(row)
                    .map(
                      (value) => `
                      <td class="border border-gray-300 px-4 py-2 min-w-[150px] whitespace-nowrap transition-colors">
                        ${value}
                      </td>`
                    )
                    .join("")}
                </tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;

    Swal.fire({
      html: tableHtml,
      width: "60vw",
      showConfirmButton: false,
      customClass: {
        popup: "rounded-xl shadow-2xl relative",
      },
      backdrop: false,
      didOpen: () => {
        const closeIcon = document.getElementById("custom-close-icon");
        if (closeIcon) {
          closeIcon.addEventListener("click", () => Swal.close());
        }
      },
    });
  };

  useEffect(() => {
    if (responseData?.files?.[0]?.cleaning_summary) {
      setCleaningSummary(responseData.files[0].cleaning_summary);
    }
  }, [responseData, setCleaningSummary]);

  const handleDropBoxClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const UploadingLoadingEffect = () => {
    return (
      /* From Uiverse.io by RaunakSpak */
      <button
        disabled=""
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-6 rounded-full shadow-lg flex items-center transition duration-300 transform hover:scale-105 active:scale-95"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="animate-spin h-5 w-5 mr-3 text-white"
        >
          <circle
            stroke-width="4"
            stroke="currentColor"
            r="10"
            cy="12"
            cx="12"
            className="opacity-25"
          ></circle>
          <path
            d="M4 12a8 8 0 018-8v8H4z"
            fill="currentColor"
            className="opacity-75"
          ></path>
        </svg>
        Uploading File...
      </button>
    );
  };

  return (
    <div className="w-full max-w-5xl bg-white rounded-xl p-3">
      {/* Tabs */}
      <div className="flex flex-row m-2 border-b">
        <button
          onClick={() => setActiveTab("static")}
          className={`px-4 py-1 btn-standard ${
            activeTab === "static"
              ? "border-b-2 border-black text-gray-800"
              : "text-gray-400"
          }`}
        >
          My Static Files
        </button>
        <button
          onClick={() => setActiveTab("connected")}
          className={`px-4 py-2 btn-standard ${
            activeTab === "connected"
              ? "border-b-2 border-black text-gray-800"
              : "text-gray-400"
          }`}
        >
          Connected Data Sources
        </button>
      </div>
      {/* Static Files Tab */}
      {activeTab === "static" && (
        <>
          <div className="flex justify-center mb-6">
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              multiple
              className="hidden"
              accept=".csv,.xlsx"
              onChange={handleFileUpload}
            />

            {/* Clickable Dropbox */}
            <div
              onClick={handleDropBoxClick}
              className="flex flex-col border-2 border-dashed border-purple-400 rounded-md p-6 text-center text-purple-600 hover:bg-purple-50 transition-all w-full max-w-md cursor-pointer"
            >
              <p className="mb-2 text-label">
                <span className="underline">Click to upload</span> or drag and
                drop
              </p>
              <p className="text-message text-gray-500">
                Supports multiple files: CSV, XLSX, XLS
              </p>
            </div>
          </div>

          <div>
            <p className="text-message text-purple-500 mb-2">
              For optimal results, follow best practices when uploading files
            </p>
            <div className="flex justify-between items-center px-4 py-3 bg-gray-100 rounded-md shadow-sm">
              <div>
                <h2 className="text-label text-gray-800">Available Files</h2>
                <p className="text-xs text-gray-500">
                  Select static files to associate with your analysis
                </p>
              </div>

              <div className="relative w-[55vh]">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
                    />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Search files"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10  pr-4 py-2 text-sm w-full border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-gray-800"
                />
              </div>
            </div>

            {isCleaning && (
              <div className="fixed inset-0 flex justify-center items-center z-50 bg-black/40">
                <DataProcessingLoader fileCleaning={fileCleaning} />
              </div>
            )}
            {isLoading && (
              <div className="fixed inset-0 flex justify-center items-center z-50">
                <UploadingLoadingEffect />
              </div>
            )}

            <div>
              {uploadedFiles.length === 0 ? (
                <div className="text-center text-gray-600 text-label py-4">
                  No files uploaded yet!
                </div>
              ) : (
                <div className="overflow-x-auto mt-4 rounded-lg shadow">
                  <div
                    className={`${
                      uploadedFiles.filter((file) =>
                        file.name
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase())
                      ).length > 3
                        ? "max-h-[30vh] overflow-y-auto"
                        : ""
                    }`}
                  >
                    <table className="min-w-full table-fixed bg-white border border-gray-300 text-message text-left">
                      <thead className="bg-gray-300 text-gray-800 sticky top-0 z-10">
                        <tr>
                          <th className="px-4 py-2 w-[45%] pl-10">File Name</th>
                          <th className="px-4 py-2 w-[35%]">Upload Date</th>
                          <th className="px-4 py-2 w-[25%]">Actions</th>
                        </tr>
                      </thead>

                      <tbody>
                        {uploadedFiles
                          .filter((file) =>
                            file.name
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase())
                          )
                          .map((file, index) => (
                            <tr
                              key={index}
                              className="border-b hover:bg-gray-100"
                            >
                              <td className="px-4 py-3 w-[45%] pl-4 break-words whitespace-pre-wrap">
                                <div className="flex items-start gap-2">
                                  <img src={excel} />
                                  <span className="text-gray-800">
                                    {file.name}
                                  </span>
                                </div>
                              </td>

                              <td className="px-4 py-3 w-[35%] text-gray-700">
                                {file.createdDate}
                              </td>
                              <td className="px-4 py-3 w-[25%]">
                                <div className="flex items-center gap-4">
                                  <div className="relative flex items-center">
                                    {showEyeHint && (
                                      <div className="absolute left-[-150px] top-1/2 -translate-y-1/2 w-max bg-blue-500 text-white text-xs px-3 py-2 rounded shadow-lg whitespace-nowrap z-10 animate-fadeIn">
                                        Click here to Preview
                                        <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rotate-45 z-[-1]" />
                                      </div>
                                    )}
                                    <IoEye
                                      className={`text-blue-600 h-6 w-6 cursor-pointer transition-transform hover:text-blue-800 ${
                                        showEyeHint ? "animate-bounce" : ""
                                      }`}
                                      onClick={() =>
                                        getPreviewByFileName(file.name)
                                      }
                                    />
                                  </div>
                                  <MdDeleteForever
                                    className="text-red-800 h-6 w-6 cursor-pointer"
                                    onClick={() => handleRemoveFile(index)}
                                  />
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              <ConfirmCleanModal
                open={showModal}
                onClose={() => setShowModal(false)}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
                cleaningSummary={cleaningSummary}
              />

              {showNotification &&
                (card === "clean" ? (
                  <CustomNotificationCard
                    title="Data Cleaned!"
                    text="Your Data has been cleaned and stored, Successfully"
                    onClose={() => setShowNotification(false)}
                  />
                ) : (
                  <CustomNotificationCard
                    title="You choose Skip! now"
                    text="Your data has been stored, Successfully"
                    onClose={() => setShowNotification(false)}
                  />
                ))}
            </div>
          </div>
        </>
      )}
      {/* Connected Data Sources Tab */}
      {activeTab === "connected" && (
        <div className="p-4 rounded-xl bg-white">
          {/* Header Section */}
          <div className="flex flex-col pb-4 gap-2">
            <h1 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              Connect Data Sources
            </h1>
            <p className="text-base font-normal text-gray-700 pl-1">
              Retrieve data from your connected sources with ease.
            </p>
          </div>

          {/* Table Container */}
          <div className="w-full max-w-4xl mx-auto mt-2 shadow-md rounded-lg overflow-hidden border border-gray-300">
            <div className="divide-y divide-gray-200 bg-white">
              {/* MySQL Row */}
              <div className="grid grid-cols-2 items-center px-10 py-4 hover:bg-gray-50 transition duration-200">
                <div className="flex flex-col text-gray-800">
                  <div className="flex items-center gap-3">
                    <SiMysql className="h-8 w-8 text-blue-500" />
                    <span className="text-base font-medium">
                      Connect to MySql
                    </span>
                  </div>
                </div>
                <div className="flex justify-end gap-10">
                  <button
                    onClick={() => {
                      setDbType("mysql");
                      setIsPopupOpen(true);
                    }}
                    className="bg-blue-600 text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-blue-700 flex items-center gap-2 transition duration-200"
                  >
                    Connect
                    <HiArrowNarrowRight className="text-lg" />
                  </button>
                  <button
                    onClick={() => setIsDataPreviewPopupOpen(true)}
                    disabled={dbType !== "mysql" && DbResponse !== null}
                    title={dbType !== "mysql" ? "Connect to MySQL first" : ""}
                    className={`px-5 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition duration-200
        ${
          dbType === "mysql"
            ? "bg-gray-600 text-white hover:bg-gray-700 cursor-pointer"
            : "bg-gray-300 text-gray-500 cursor-not-allowed opacity-60"
        }`}
                  >
                    Data preview
                  </button>
                </div>
              </div>

              {/* Vertica Row */}
              <div className="grid grid-cols-2 items-center px-10 py-4 hover:bg-gray-50 transition duration-200">
                <div className="flex flex-col text-gray-800">
                  <div className="flex items-center gap-3">
                    <FaDatabase className="h-8 w-8 text-blue-500" />
                    <span className="text-base font-medium">
                      Connect to Vertica
                    </span>
                  </div>
                </div>
                <div className="flex justify-end gap-10">
                  <button
                    onClick={() => {
                      setDbType("vertica");
                      setIsPopupOpen(true);
                    }}
                    className="bg-blue-600 text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-blue-700 flex items-center gap-2 transition duration-200"
                  >
                    Connect <HiArrowNarrowRight className="text-lg" />
                  </button>
                  <button
                    onClick={() => setIsDataPreviewPopupOpen(true)}
                    disabled={dbType !== "vertica" && DbResponse !== null}
                    title={
                      dbType !== "vertica" ? "Connect to Vertica first" : ""
                    }
                    className={`px-5 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition duration-200
        ${
          dbType === "vertica"
            ? "bg-gray-600 text-white hover:bg-gray-700 cursor-pointer"
            : "bg-gray-300 text-gray-500 cursor-not-allowed opacity-60"
        }`}
                  >
                    Data preview
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Popup (conditionally rendered) */}
          {isPopupOpen && (
            <PopupForm
              isOpen={isPopupOpen}
              onClose={() => setIsPopupOpen(false)}
              setDbResponse={setDbResponse}
              dbType={dbType}
            />
          )}

          {isDataPreviewPopupOpen && (
            <DbDataPreviewPopup
              DbResponse={DbResponse}
              dbType={dbType}
              onClose={() => setIsDataPreviewPopupOpen(false)}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default AddDataPopup;
