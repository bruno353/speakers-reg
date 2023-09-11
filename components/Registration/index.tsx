"use client";
// import { useState } from 'react'
import { useEffect, useState } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import taskContractABI from "@/utils/abi/taskContractABI.json";
import {
  readContract,
  readContracts,
  writeContract,
  prepareWriteContract,
  waitForTransaction,
} from "@wagmi/core";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Checkbox from "@material-ui/core/Checkbox";
import {
  IPFSSubmition,
  TasksOverview,
  TasksPagination,
  TasksCounting,
} from "@/types/task";
import erc20ContractABI from "@/utils/abi/erc20ContractABI.json";
import { File, SmileySad, Info } from "phosphor-react";

const Registration = () => {
  const [stateOpen, setStateOpen] = useState<String>("");
  const [selectedOptions, setSelectedOptions] = useState({});

  function handleCheckboxChangeSubTopic(categoryIndex, subTopicIndex) {
    setSelectedOptions({categoryIndex, subTopicIndex});
  }
  function handleCheckboxChangeDelivery(categoryIndex, deliveryIndex) {
    const newSelectedOptions = {...selectedOptions}
    newSelectedOptions['deliveryIndex'] = deliveryIndex
    setSelectedOptions(newSelectedOptions);
  }

  function handleBookTimeSlot() {
    // const params = {
    //   a2: Object.keys(selectedOptions.subTopics)
    //     .filter(
    //       (key) => key.startsWith(index) && selectedOptions.subTopics[key]
    //     )
    //     .map((key) => parseInt(key.split("-")[1]) + 1)
    //     .join(","),
    //   a3: Object.keys(selectedOptions.deliveryMethod)
    //     .filter(
    //       (key) => key.startsWith(index) && selectedOptions.deliveryMethod[key]
    //     )
    //     .map((key) => parseInt(key.split("-")[1]) + 1)
    //     .join(","),
    // };

    // const url = `${href}?a2=${params.a2}&a3=${params.a3}`;
    const theme = datas[selectedOptions['categoryIndex']]
    const urlTheme = theme.subTopicsOptions[selectedOptions['subTopicIndex']].url
    window.location.href = urlTheme; // Redireciona para a URL construída
  }

  function handleChange(index: string) {
    setSelectedOptions({})
    setStateOpen(index);
  }

  const datas = [
    {
      name: "Day 1 - Data & Infrastructure",
      subTopicsOptions: [
        {
          name: "Keynotes: 11:30am - 11:45am",
          delivery: ["Keynotes"],
          url: "https://calendly.com/kathleen-ragos/data-infrastructure-data-sharing-and-validation"
        },
        {
          name: "Keynotes: 4:00pm - 4:30pm",
          delivery: ["Keynotes"],
          url: "https://calendly.com/kathleen-ragos/2"
        },
        {
          name: "Panel: 1:30pm - 2:15pm",
          delivery: ["Keynotes"],
          url: "https://calendly.com/kathleen-ragos/3"
        },
        {
          name: "Panel: 4:30pm - 5:00pm",
          delivery: ["Panels"],
          url: "https://calendly.com/kathleen-ragos/4"
        }
      ],

    },
    {
      name: "Day 2 - AI & Blockchain",
      subTopicsOptions: [
        {
          name: "Keynotes: 9:10am - 9:35am",
          delivery: ["Keynotes"],
          url: "https://calendly.com/kathleen-ragos/1"
        },
        {
          name: "Keynotes: 10:30am - 10:50am",
          delivery: ["Keynotes"],
          url: "https://calendly.com/kathleen-ragos/b2"
        },
        {
          name: "Keynotes: 11:55am - 12:30pm",
          delivery: ["Keynotes"],
          url: "https://calendly.com/kathleen-ragos/b3"
        },
        {
          name: "Keynotes: 3:00pm - 3:20pm",
          delivery: ["Keynotes"],
          url: "https://calendly.com/kathleen-ragos/b4"
        },
        {
          name: "Panel: 2:35pm - 3:00pm",
          delivery: ["Keynotes"],
          url: "https://calendly.com/kathleen-ragos/b5"
        },
        {
          name: "Panel: 4:10pm - 4:30pm",
          delivery: ["Panels"],
          url: "https://calendly.com/kathleen-ragos/b6"
        }
      ],
    },
    {
      name: "Day 3",
      subTopicsOptions: [
        {
          name: "Keynotes: 8:35am - 9:00am",
          delivery: ["Keynotes"],
          url: "https://calendly.com/kathleen-ragos/c1"
        },
        {
          name: "Keynotes: 9:45am - 10:05am",
          delivery: ["Keynotes"],
          url: "https://calendly.com/kathleen-ragos/c2"
        },
        {
          name: "Keynotes: 11:10am - 11:30am",
          delivery: ["Panels"],
          url: "https://calendly.com/kathleen-ragos/c3"
        },
        {
          name: "Panel: 9:15am - 9:40am",
          delivery: ["Debate"],
          url: "https://calendly.com/kathleen-ragos/c4"
        },
        {
          name: "Panel: 10:20am - 11:05am",
          delivery: ["Debate"],
          url: "https://calendly.com/kathleen-ragos/c5"
        },
        {
          name: "Panel: 12:30pm - 1:00pm",
          delivery: ["Debate"],
          url: "https://calendly.com/kathleen-ragos/c6"
        },
        {
          name: "Product demo: 11:35am - 11:55am",
          delivery: ["Debate"],
          url: "https://calendly.com/kathleen-ragos/c7"
        },
        {
          name: "Product demo: 12:00pm - 12:30pm",
          delivery: ["Debate"],
          url: "https://calendly.com/kathleen-ragos/c8"
        }
      ],

    },
    
    // {
    //   name: "Exchange-Traded Funds (ETFs), Bonds, Private Equities",
    //   subTopicsOptions: [
    //     "CBDC Infrastructure and Services",
    //     "Supply Chain Financing: Real-time tracking",
    //     "Tokenized Commodities",
    //     "Personalized Education Records and Credentials",
    //   ],
    //   deliveryMethodOptions: [
    //     "Product demo screen share (40min)",
    //     "Product demo screen share (30min)",
    //     "Panel talks (between 2-5 people)",
    //     "Product demo screen share (40min)",
    //   ],
    //   href: "https://calendly.com/bruno-santos-laureano/securitization",
    // },
  ];

  return (
    <>
      <section
        className="px-[20px] pt-[20px] pb-[400px] lg:px-[100px] lg:pt-[80px]"
        id={"taskStart"}
      >
        <div className="container px-0">
          <div className="text-[16px] font-normal !leading-[19px] text-[#000000]">
            <div className="text-[21px] font-bold !leading-[36px] lg:text-[30px]">
              Speaker registration
            </div>
            <div className="mt-[24px] lg:mt-[38px] lg:flex lg:justify-between">
              <div className="mb-[19px] flex lg:mb-0 lg:w-[345px]">
                <p className="mr-[12px] flex text-[12px] font-bold lg:mr-[19px] lg:text-[18px]">
                  Step 01
                </p>
                <p className="w-[200px] text-[11px] lg:w-[251px] lg:text-[16px]">
                  Pick the industries/areas in which you would share your
                  expertise.
                </p>
              </div>
              <div className="mb-[19px] flex lg:mb-0 lg:w-[345px]">
                <p className="mr-[12px] flex text-[12px] font-bold lg:mr-[19px] lg:text-[18px]">
                  Step 02
                </p>
                <p className="w-[200px] text-[11px] lg:w-[251px] lg:text-[16px]">
                  Pick the delivery method (e.g., keynote speech, panel talk,
                  product demo)
                </p>
              </div>
              <div className="flex lg:mb-0 lg:w-[345px]">
                <p className="mr-[12px] flex text-[12px] font-bold lg:mr-[19px] lg:text-[18px]">
                  Step 03
                </p>
                <p className="w-[200px] text-[11px] lg:w-[251px] lg:text-[16px]">
                  Pick the available dates and time slots to lock in your
                  segment
                </p>
              </div>
            </div>
            <div className="mt-[40px] lg:mt-[79px] lg:grid lg:grid-cols-2 lg:gap-x-[10px] lg:gap-y-[15px]">
              {datas.map((data, index) =>
                stateOpen !== String(index) ? (
                  <div
                    key={index}
                    onClick={() => {
                      handleChange(String(index));
                    }}
                    className="mb-[12px] flex h-[56px] cursor-pointer justify-between rounded-[5px] bg-[#0354EC] py-[5px] pl-[28px] pr-[13px] font-medium text-white hover:bg-[#173979] lg:mb-0  lg:py-0"
                  >
                    <div className="flex items-center text-[12px] !leading-[22px] lg:text-[18px]">
                      {data.name}
                    </div>
                    <div className="flex items-center text-[21px] !leading-[36px] lg:text-[30px]">
                      +
                    </div>
                  </div>
                ) : (
                  <div
                    key={index}
                    className="mb-[12px] rounded-[5px] bg-[#F3F3F3] pb-[55px] pl-[21px] pr-[13px] pt-[17px] font-medium text-[#000000] lg:mb-0  lg:pl-[28px]"
                  >
                    <div className="flex justify-between">
                      <div className="flex items-center text-[12px] !leading-[22px] lg:text-[18px]">
                        {data.name}
                      </div>
                      <div
                        onClick={() => {
                          handleChange("-1");
                        }}
                        className="flex cursor-pointer items-center text-[21px] !leading-[36px] text-[#646464] lg:text-[30px]"
                      >
                        -
                      </div>
                    </div>
                    <div className="mt-[30px] pl-[10px] lg:mt-[41px]">
                      <div>
                        <div className="flex">
                          <div className="mr-[12px] border-b border-[#000000] text-[11px] font-bold lg:text-[16px]">
                            Sub topics
                          </div>
                        </div>
                        <div className="mt-[24px]">
                          <div className="lg:grid lg:grid-cols-2 lg:gap-x-[41px] lg:gap-y-[13px]">
                            {data.subTopicsOptions.map((topic, subIndex) => (
                              <div className="flex">
                                <Checkbox
                                  checked={
                                    selectedOptions['subTopicIndex'] === subIndex || false
                                  }
                                  onChange={(e) =>
                                    handleCheckboxChangeSubTopic(
                                      index,
                                      subIndex,
                                    )
                                  }
                                  color="default"
                                  inputProps={{ "aria-label": "" }}
                                  className=""
                                />
                                <p className="mb-[11px] flex items-center text-[10px] font-normal text-[#646464] lg:mb-0 lg:text-[14px]">
                                  {topic.name}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      {selectedOptions['subTopicIndex'] >= 0 && (
                        <a
                        onClick={() =>
                          handleBookTimeSlot()
                        }
                        className="mt-[35px] flex h-[40px] w-[120px] cursor-pointer  items-center justify-center rounded-[8px] bg-[#0354EC] px-[15px] text-[11px] font-bold text-white hover:bg-[#173979] lg:mt-[45px] lg:h-[51px] lg:w-[180px] lg:px-[32px] lg:text-[16px]"
                      >
                        Book time slot
                      </a>
                        )}
                      {/* {selectedOptions['subTopicIndex'] >= 0 && (
                      <div className="mt-[30px] lg:mt-[44px]">
                      <div className="flex">
                        <div className="mr-[12px] border-b border-[#000000] text-[11px] font-bold lg:text-[16px]">
                          Delivery method
                        </div>
                      </div>
                      <div className="mt-[24px]">
                        <div className="lg:grid lg:grid-cols-2 lg:gap-x-[41px] lg:gap-y-[13px]">
                          {data.subTopicsOptions[selectedOptions['subTopicIndex']].delivery.map(
                            (topic, subIndex) => (
                              <div className="flex">
                                <Checkbox
                                    checked={
                                    selectedOptions['deliveryIndex'] === subIndex || false
                                  }
                                  onChange={(e) =>
                                    handleCheckboxChangeDelivery(
                                      index,
                                      subIndex,
                                    )
                                  }
                                  color="default"
                                  inputProps={{ "aria-label": "" }}
                                  className=""
                                />
                                <p className="mb-[8px] flex items-center text-[10px] font-normal text-[#646464] lg:mb-0 lg:text-[14px]">
                                  {topic}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                        {selectedOptions['deliveryIndex'] >= 0 && (
                        <a
                        onClick={() =>
                          handleBookTimeSlot()
                        }
                        className="mt-[35px] flex h-[40px] w-[120px] cursor-pointer  items-center justify-center rounded-[8px] bg-[#0354EC] px-[15px] text-[11px] font-bold text-white hover:bg-[#173979] lg:mt-[45px] lg:h-[51px] lg:w-[180px] lg:px-[32px] lg:text-[16px]"
                      >
                        Book time slot
                      </a>
                        )}

                      </div>
                    </div>
                      )} */}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Registration;
