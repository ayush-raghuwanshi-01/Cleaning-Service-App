import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import BarChartIcon from "@mui/icons-material/BarChart";
import { FaTable } from "react-icons/fa6";
import { BsThreeDotsVertical } from "react-icons/bs";
import Bot from "../../assets/typed.svg";
import user1 from "../../assets/user1.png";
import { Loader2 } from "lucide-react";
import Chart from "./Charts/Chart";
import DonutLargeIcon from "@mui/icons-material/DonutLarge";
import PieChartIcon from "@mui/icons-material/PieChart";
import { Menu } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import InsightsIcon from "@mui/icons-material/Insights";
import GroupedLine from "../../assets/icons/GroupedLine.svg";
import GroupedBar from "../../assets/icons/GroupedBar.svg";
import { BsFiletypeSql } from "react-icons/bs";
import { MdPieChartOutline } from "react-icons/md";
import { PiFileSql } from "react-icons/pi";
import TypeWriter from './TypeWriter';
import { TypeWriterProvider } from './TypeWriterContext';

const ResponseCard = ({ response }) => {
  const [showSQL, setShowSQL] = useState(false);
  const [showLoading, setShowLoading] = useState(true);
  const responseEndRef = useRef(null);
  const [showResult, setShowResult] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const closeDropdown = () => setAnchorEl(null);

  const [menuOpen, setMenuOpen] = useState(false);

  const openDropdown = (event) => setAnchorEl(event.currentTarget);

  useEffect(() => {
    if (response.chart == null) {
      setShowResult(true);
    }
  }, []);

  useEffect(() => {
    if (!response?.aiResponse) return;


    setTimeout(() => {
      if (typeof response.aiResponse.summary === "string") {
        let index = 0;
        const summaryText = response.aiResponse.summary;
        const interval = setInterval(() => {
          index++;
          if (index >= summaryText.length) clearInterval(interval);
        }, 50);
        return () => clearInterval(interval);
      }
    }, 1500);
  }, [response]);

  function formatSummary(summaryObj) {
    if (!summaryObj) return null;

    let summary = summaryObj.trim();
    const paragraphs = summary.split("\n").filter((para) => para.trim() !== "");

    return (
      <TypeWriterProvider>
        <div className="bg-white py-2 px-4 space-y-3 text-gray-800">
          {paragraphs.map((para, index) => (
            <TypeWriter
              key={index}
              index={index}
              text={para}
              className={`text-base leading-relaxed ${
                /^# /.test(para) ? 'text-xl font-bold border-b pb-1' :
                /^## /.test(para) ? 'text-lg font-semibold mt-3' :
                /^\*\*(.*?)\*\*/.test(para) ? 'font-medium' :
                /^\* /.test(para) ? 'ml-6 list-disc' :
                'text-gray-700'
              }`}
            />
          ))}
        </div>
      </TypeWriterProvider>
    );
  }

  useEffect(() => {
    const hasStartedRendering =
      response?.aiResponse?.summary ||
      response?.aiResponse?.sql_query ||
      response?.aiResponse?.result ||
      response?.aiResponse?.analysis ||
      response?.aiResponse?.response ||
      response?.aiResponse?.optimizations;

    if (hasStartedRendering) {
      setShowLoading(false);
    }
  }, [
    response?.aiResponse?.summary,
    response?.aiResponse?.sql_query,
    response?.aiResponse?.result,
    response?.aiResponse?.analysis,
    response?.aiResponse?.optimizations,
    response?.aiResponse?.response,
  ]);

  useEffect(() => {
    responseEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [response?.aiResponse?.sql_query, response?.aiResponse?.result]);

  const loaderMessages = [
    "AI is Analyzing your data...",
    "AI is generating a response...",
  ];

  const [loaderIndex, setLoaderIndex] = useState(0);
  const loaderMessage = loaderMessages[loaderIndex];

  const chartTypes = [
    {
      title: "Bar Chart",
      icon: <BarChartIcon className="text-blue-500" />,
      onClick: () => {
        setShowResult(false);
        response.chartType = "bar";
        closeDropdown();
      },
      isEnabled: response.chart?.multi_value === false,
      isActive: response.chartType === "bar",
    },
    {
      title: "Line Chart",
      icon: <InsightsIcon className="text-green-500" />,
      onClick: () => {
        setShowResult(false);
        response.chartType = "line";
        closeDropdown();
      },
      isEnabled: response.chart?.multi_value === false,
      isActive: response.chartType === "line",
    },
    {
      title: "Pie Chart",
      icon: <PieChartIcon className="text-pink-500" />,
      onClick: () => {
        setShowResult(false);
        response.chartType = "pie";
        closeDropdown();
      },
      isEnabled:
        response.chart?.multi_value === false &&
        response.chart?.labels?.length <= 10,
      isActive: response.chartType === "pie",
    },
    {
      title: "Doughnut Chart",
      icon: <DonutLargeIcon className="text-yellow-600" />,
      onClick: () => {
        setShowResult(false);
        response.chartType = "doughnut";
        closeDropdown();
      },
      isEnabled:
        response.chart?.multi_value === false &&
        response.chart?.labels?.length <= 10,
      isActive: response.chartType === "doughnut",
    },
    {
      title: "Multi Bar Chart",
      icon: <img src={GroupedBar} alt="GroupedBar" />,
      onClick: () => {
        setShowResult(false);
        response.chartType = "bar";
        closeDropdown();
      },
      isEnabled: response.chart?.multi_value === true,
      isActive: response.chartType === "bar" && response.chart?.multi_value,
    },
    {
      title: "Multi Line Chart",
      icon: <img src={GroupedLine} alt="GroupedLine" />,
      onClick: () => {
        setShowResult(false);
        response.chartType = "line";
        closeDropdown();
      },
      isEnabled: response.chart?.multi_value === true,
      isActive: response.chartType === "line" && response.chart?.multi_value,
    },
  ];

  useEffect(() => {
    if (!showLoading) return;

    const timeout = setTimeout(() => {
      setLoaderIndex(1);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [showLoading]);

  return (
    <div className="z-20 w-full space-y-3 bg-[#f0f1f9]">
      <div className="flex justify-end px-3 py-2 mt-3 ">
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-start space-x-3"
        >
          {/* User message box */}
          <div
            className="relative bg-[#dbeafe] border border-[#e0e3f3] right-10
      px-2 py-2 max-w-[30vw] rounded-tr-sm rounded-xl shadow-lg text-left
      transition-all duration-300 "
          >
            <p
              className="text-gray-900 text-label rounded-xl  leading-snug break-words whitespace-pre-wrap font-sans"
              style={{ fontSize: "clamp(12px, 2vw, 14px)" }}
            >
              {response?.userQuery}
            </p>

            {/* User avatar positioned top-right inside the box */}
            <div className="absolute top-0 -right-12 ">
              <img
                src={user1}
                alt="User Avatar"
                className="h-9 w-9 rounded-full bg-white border border-gray-300 shadow"
              />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex flex-row items-start space-x-3">
        <div className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm">
          <img src={Bot} className="h-6 w-6 text-[rgb(244,242,250)]" />
        </div>
        {showLoading && (
          <div className="flex absolute left-16 mt-3 w-[90%] items-center  space-x-3 animate-blink bg-[#f0f1f9]">
            <Loader2 className="w-5 h-5 text-gray-700 animate-spin" />
            <span className="text-sm font-medium text-gray-700">
              {loaderMessage}
            </span>
          </div>
        )}

        <div className="flex flex-col w-full max-w-[78%] space-y-2 px-4 rounded-md  bg-white">
          <>
            {!showLoading && (
              <div className="flex justify-between mt-3 z-20">
                <div className=" text-gray-900 text-base font-semibold">
                  AI Response :
                </div>
                <div className="flex justify-end">
                  <div className="flex relative bg-white text-message text-gray-700 z-10">
                    {/* SQL Icon */}
                    <div
                      className="relative group flex flex-col items-center justify-center rounded-full hover:bg-blue-50 w-8 h-8"
                      onClick={() => setShowSQL(true)}
                    >
                      <PiFileSql className="w-6 h-6 hover:scale-105 text-blue-600" />
                      <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center">
                        <div className="relative z-10 p-2 text-xs w-[8vw] flex justify-center leading-none text-white whitespace-no-wrap bg-gray-600 rounded shadow-lg">
                          SQL Query
                        </div>
                        <div className="w-2 h-2 -mt-1 rotate-45 bg-gray-600"></div>
                      </div>
                    </div>

                    {/* Pie Chart Icon */}
                    <div
                      className="relative group flex flex-col items-center justify-center rounded-full hover:bg-blue-50 w-8 h-8"
                      onClick={openDropdown}
                    >
                      <MdPieChartOutline className="w-6 h-6 hover:scale-105  text-blue-600" />
                      <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center">
                        <div className="relative z-10 p-2 w-[10vw] flex justify-center text-xs leading-none text-white whitespace-no-wrap bg-gray-600 rounded shadow-lg">
                          change Chart Type
                        </div>
                        <div className="w-2 h-2 -mt-1 rotate-45 bg-gray-600"></div>
                      </div>
                    </div>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={closeDropdown}
                      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                      transformOrigin={{ vertical: "top", horizontal: "right" }}
                      PaperProps={{
                        sx: {
                          overflow: "visible",
                          borderRadius: "8px",
                          boxShadow: 4,
                          width: 200,
                          backgroundColor: "white",
                          position: "relative",
                          "&::before": {
                            content: '""',
                            position: "absolute",
                            top: -6,
                            right: 5,
                            width: 12,
                            height: 12,
                            backgroundColor: "white", // Tailwind's bg-blue-50
                            transform: "rotate(45deg)",
                            zIndex: 1,
                            boxShadow: "-2px -2px 3px rgba(0,0,0,0.1)",
                            borderTop: "1px solid #e5e7eb",
                            borderLeft: "1px solid #e5e7eb",
                          },
                        },
                      }}
                    >
                      {/* Header with blue background */}
                      <div className="border-b flex items-center justify-between px-2 pb-1 rounded-t-md">
                        <span className="font-semibold text-gray-800 text-sm">
                          Change chart type
                        </span>
                        <button
                          onClick={closeDropdown}
                          className="text-gray-400 hover:text-black"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Rest of dropdown (default white) */}
                      <div className="grid grid-cols-3 gap-1 px-1 py-1">
                        {chartTypes.map(
                          ({ title, icon, onClick, isEnabled }, idx) => (
                            <Tooltip key={idx} title={title} placement="top">
                              <div
                                onClick={() => isEnabled && onClick()}
                                className={`rounded-lg transition-all duration-200 hover:bg-gray-100 px-4 py-1 items-center ${
                                  isEnabled ? "cursor-pointer" : "opacity-40"
                                }`}
                              >
                                {icon}
                              </div>
                            </Tooltip>
                          )
                        )}
                      </div>

                      <div className="px-6 pb-1 flex flex-col items-start">
                        <div
                          className="grid grid-cols-1 py-1"
                          onClick={() => {
                            setShowResult(true);
                            closeDropdown();
                          }}
                        >
                          <FaTable className="w-5 h-5 hover:scale-105 text-blue-500" />
                        </div>
                      </div>
                    </Menu>

                    {/* Download Icon */}
                    <button
                      onClick={() => setMenuOpen(!menuOpen)}
                      className="relative group flex flex-col items-center justify-center rounded-full hover:bg-blue-50 w-8 h-8 text-gray-900 focus:outline-none"
                    >
                      <BsThreeDotsVertical className="w-5 h-5 text-gray-600" />
                      <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center">
                        <div className="relative z-10 p-2 w-[10vw] flex justify-center text-xs leading-none text-white whitespace-no-wrap bg-gray-600 rounded shadow-lg">
                          Download Chart
                        </div>
                        <div className="w-2 h-2 -mt-1 rotate-45 bg-gray-600"></div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {response?.chart && !showResult && (
              <div className="w-full bg-white sm:px-2 sm:py-2 animate-fadeIn">
                <Chart
                  chartResponse={response.chart}
                  chartType={response.chartType}
                />
              </div>
            )}

            {response?.aiResponse?.result && showResult && (
              <TypeWriterProvider>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="bg-white rounded-tl-sm  font-sans"
                >
                  {!Array.isArray(response.aiResponse.result) && (
                    <TypeWriter 
                      index={0}
                      text={response.aiResponse.result}
                      className="text-label text-gray-800 px-2 pb-2"
                    />
                  )}
                  {Array.isArray(response.aiResponse.result) &&
                  typeof response.aiResponse.result[0] === "object" ? (
                    <div className="max-h-[300px] overflow-auto scrollbar-xy max-w-full border rounded  space-y-2 my-3 mx-2">
                      <table className="min-w-full text-left border-collapse text-message text-gray-800">
                        <thead className="bg-gray-200 text-gray-800 sticky top-0 z-10">
                          <tr>
                            {Object.keys(response.aiResponse.result[0]).map(
                              (key, index) => (
                                <th
                                  key={index}
                                  className="px-4 py-2 border border-gray-400 whitespace-nowrap text-query bg-gray-200"
                                >
                                  {key}
                                </th>
                              )
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {response.aiResponse.result.map((row, rowIndex) => (
                            <tr
                              key={rowIndex}
                              className="odd:bg-white even:bg-gray-50"
                            >
                              {Object.values(row).map((value, colIndex) => (
                                <td
                                  key={colIndex}
                                  className="text-message px-4 py-2 border border-gray-300 whitespace-nowrap"
                                >
                                  {value}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null}
                </motion.div>
              </TypeWriterProvider>
            )}

            {response?.aiResponse?.response && showResult && (
              <TypeWriterProvider>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="bg-white rounded-tl-sm font-sans"
                >
                  <TypeWriter 
                    index={0}
                    text={response.aiResponse.response}
                    className="text-label text-gray-800 px-2 pb-2"
                  />
                </motion.div>
              </TypeWriterProvider>
            )}

            {response?.aiResponse?.sql_query && showSQL && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center"
              >
                <div className="bg-white p-5 rounded-xl -top-5 -right-5 shadow-xl border h-[25vw] w-[45vw] border-gray-300 relative">
                  <button
                    onClick={() => setShowSQL(false)}
                    className="absolute top-3 right-3 text-gray-500 hover:text-black transition"
                  >
                    ✕
                  </button>
                  <div className="flex items-center mb-4 space-x-2">
                    <BsFiletypeSql className="text-xl text-blue-600" />
                    <h2 className="text-xl font-semibold text-gray-800">
                      Structured Query Language (SQL)
                    </h2>
                  </div>
                  <pre className="bg-gray-100 p-4 h-[19vw] rounded-lg text-gray-800 text-label whitespace-pre-wrap overflow-x-auto border border-blue-400">
                    {response.aiResponse.sql_query}
                  </pre>
                </div>
              </motion.div>
            )}

            {response?.aiResponse?.analysis && showResult && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="space-y-2"
              >
                {formatSummary(response.aiResponse.analysis)}
              </motion.div>
            )}

            {response?.aiResponse?.optimizations &&
              showResult &&
              response.aiResponse.optimizations.length > 0 && (
                <TypeWriterProvider>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="bg-white p-2 rounded-xl shadow border border-gray-300 space-y-2"
                  >
                    <ul className="list-disc ml-10 text-gray-700 space-y-2">
                      {response.aiResponse.optimizations.map((opt, idx) => (
                        <li key={idx}>
                          <TypeWriter text={opt} index={idx} className="inline" />
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                </TypeWriterProvider>
              )}

            {response?.aiResponse?.summary && showResult && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className=""
              >
                {formatSummary(response.aiResponse.summary)}
              </motion.div>
            )}
          </>
        </div>

        <div ref={responseEndRef}></div>
      </div>
    </div>
  );
};

export default ResponseCard;
