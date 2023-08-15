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
  const [selectedOptions, setSelectedOptions] = useState({
    subTopics: {},
    deliveryMethod: {},
  });

  function handleCheckboxChange(category, index, subIndex, checked) {
    const newSelectedOptions = { ...selectedOptions };
    newSelectedOptions[category][`${index}-${subIndex}`] = checked;
    setSelectedOptions(newSelectedOptions);
  }

  function handleBookTimeSlot(href, index) {
    const params = {
      a2: Object.keys(selectedOptions.subTopics)
        .filter(
          (key) => key.startsWith(index) && selectedOptions.subTopics[key]
        )
        .map((key) => parseInt(key.split("-")[1]) + 1)
        .join(","),
      a3: Object.keys(selectedOptions.deliveryMethod)
        .filter(
          (key) => key.startsWith(index) && selectedOptions.deliveryMethod[key]
        )
        .map((key) => parseInt(key.split("-")[1]) + 1)
        .join(","),
    };

    const url = `${href}?a2=${params.a2}&a3=${params.a3}`;
    window.location.href = url; // Redireciona para a URL construída
  }

  function handleChange(index: string) {
    setStateOpen(index);
  }

  const datas = [
    {
      name: "Securitization of real estate, private equity, tokenization",
      subTopicsOptions: [
        "Crypto-Based Universal Basic Income",
        "On-Chain Diplomacy",
        "Decentralized Intellectual Property Rights Management",
        "Personalized Education Records and Credentials",
      ],
      deliveryMethodOptions: [
        "Virtual keynote speech + pitch deck ? sharing (20min + 5min Q&A)",
        "Virtual Panel talk (20min)",
        "Panel talks (between 2-5 people)",
        "Product demo screen share (40min)",
      ],
      href: "https://calendly.com/bruno-santos-laureano/securitization",
    },
    {
      name: "Exchange-Traded Funds (ETFs), Bonds, Private Equities",
      subTopicsOptions: [
        "CBDC Infrastructure and Services",
        "Supply Chain Financing: Real-time tracking",
        "Tokenized Commodities",
        "Personalized Education Records and Credentials",
      ],
      deliveryMethodOptions: [
        "Product demo screen share (40min)",
        "Product demo screen share (30min)",
        "Panel talks (between 2-5 people)",
        "Product demo screen share (40min)",
      ],
      href: "https://calendly.com/bruno-santos-laureano/securitization",
    },
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
            <div className="mt-[40px] lg:mt-[79px] lg:grid lg:grid-cols-2 lg:gap-x-[10px] lg:gap-y-[9px]">
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
                          <div className="-mb-[3px] flex items-end text-[8px] font-normal text-[#646464] lg:text-[10px]">
                            You can choose multiple
                          </div>
                        </div>
                        <div className="mt-[24px]">
                          <div className="lg:grid lg:grid-cols-2 lg:gap-x-[41px] lg:gap-y-[13px]">
                            {data.subTopicsOptions.map((topic, subIndex) => (
                              <div className="flex">
                                <Checkbox
                                  checked={
                                    selectedOptions.subTopics[
                                      `${index}-${subIndex}`
                                    ] || false
                                  }
                                  onChange={(e) =>
                                    handleCheckboxChange(
                                      "subTopics",
                                      index,
                                      subIndex,
                                      e.target.checked
                                    )
                                  }
                                  color="default"
                                  inputProps={{ "aria-label": "" }}
                                  className=""
                                />
                                <p className="mb-[11px] flex items-center text-[10px] font-normal text-[#646464] lg:mb-0 lg:text-[14px]">
                                  {topic}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="mt-[30px] lg:mt-[44px]">
                        <div className="flex">
                          <div className="mr-[12px] border-b border-[#000000] text-[11px] font-bold lg:text-[16px]">
                            Delivery method
                          </div>
                          <div className="-mb-[3px] flex items-end text-[10px] font-normal text-[#646464]">
                            You can choose multiple
                          </div>
                        </div>
                        <div className="mt-[24px]">
                          <div className="lg:grid lg:grid-cols-2 lg:gap-x-[41px] lg:gap-y-[13px]">
                            {data.deliveryMethodOptions.map(
                              (method, subIndex) => (
                                <div className="flex">
                                  <Checkbox
                                    checked={
                                      selectedOptions.deliveryMethod[
                                        `${index}-${subIndex}`
                                      ] || false
                                    }
                                    onChange={(e) =>
                                      handleCheckboxChange(
                                        "deliveryMethod",
                                        index,
                                        subIndex,
                                        e.target.checked
                                      )
                                    }
                                    color="default"
                                    inputProps={{ "aria-label": "" }}
                                    className=""
                                  />
                                  <p className="mb-[8px] flex items-center text-[10px] font-normal text-[#646464] lg:mb-0 lg:text-[14px]">
                                    {method}
                                  </p>
                                </div>
                              )
                            )}
                            <a
                              onClick={() =>
                                handleBookTimeSlot(data.href, index)
                              }
                              className="mt-[35px] flex h-[40px] w-[120px] cursor-pointer  items-center justify-center rounded-[8px] bg-[#0354EC] px-[15px] text-[11px] font-bold text-white hover:bg-[#173979] lg:mt-[45px] lg:h-[51px] lg:w-[180px] lg:px-[32px] lg:text-[16px]"
                            >
                              Book time slot
                            </a>
                          </div>
                        </div>
                      </div>
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
