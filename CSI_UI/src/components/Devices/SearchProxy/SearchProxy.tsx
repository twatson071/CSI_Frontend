import {
  RuxButton,
  RuxInput,
  RuxMenu,
  RuxMenuItem,
  RuxPopUp,
} from "@astrouxds/react";
import {
  Dispatch,
  SetStateAction,
  useState,
  useRef,
  KeyboardEvent,
} from "react";
import "./SearchProxy.css";

type PropTypes = {
  proxies: string[];
  setproxy: Dispatch<SetStateAction<string | null>>;
  proxy: string | null;
  addToPassQueue?: (serviceUrl: string) => void;
  pass?: string;
};

const SearchProxy = ({ proxies, setproxy, proxy }: PropTypes) => {
  const [inputValue, setInputValue] = useState<string>("");
  const [currentProxy, setCurrentProxy] = useState<string | null>(null);

  const searchPopup = useRef<HTMLRuxPopUpElement | null>(null);

  const filteredProxies = proxies.filter((proxyString) =>
    proxyString.toLowerCase().includes(inputValue.toLowerCase())
  );

  if (inputValue && filteredProxies.length === 1 && !currentProxy) {
    setCurrentProxy(filteredProxies[0]);
  }

  const sendProxy = (selectedProxy: string) => {
    setproxy(selectedProxy);
    setCurrentProxy(null);
    setInputValue("");
    searchPopup.current?.hide();
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLRuxInputElement>) => {
    if (e.key !== "Enter" || !currentProxy) return;
    sendProxy(currentProxy); // Uses sendProxy which clears input
  };

  const handleMenuSelect = (selectedValue: string) => {
    setproxy(selectedValue); // Update parent component's state
    setInputValue(selectedValue); // Update the input field to display the selected value
    setCurrentProxy(selectedValue); // Update internal currentProxy state
    searchPopup.current?.hide(); // Explicitly hide the popup
  };

  const hasMainListItemsToShow = filteredProxies.length > 0;
  const showMenu = hasMainListItemsToShow;

  return (
    <>
      <div className="proxy_container">
        <RuxPopUp
          className="proxy_input-pop-up"
          placement="top-start"
          closeOnSelect={true}
          ref={searchPopup}
        >
          <RuxButton slot="trigger" iconOnly icon="unfold-more" />
          {showMenu ? (
            <RuxMenu
              className="proxy_input-menu"
              onRuxmenuselected={(e) => {
                const selectedValue = e.detail.value as string;
                handleMenuSelect(selectedValue); // Ensure this calls setproxy
                // ... other actions like closing popup ...
              }}
            >
              {hasMainListItemsToShow && (
                <>
                  <h4 className="menu-title">
                    {inputValue ? "Matching Service URLs" : "All Service URLs"}
                  </h4>
                  {filteredProxies.map((item, index) => (
                    <RuxMenuItem
                      selected={currentProxy === item}
                      key={`filtered-${index}-${item}`}
                      value={item}
                    >
                      {item}
                    </RuxMenuItem>
                  ))}
                </>
              )}
            </RuxMenu>
          ) : (
            // Show "no match" only if there was input
            inputValue && (
              <span className="proxy_no-match">
                No matching service URL found.
              </span>
            )
            // If no input and no items, popup will be empty, which is fine.
          )}
        </RuxPopUp>
        <RuxInput
          type="search"
          placeholder="Start typing to search for a service URL..."
          value={inputValue}
          onRuxinput={(e) => {
            const newValue = (e.target as HTMLRuxInputElement).value;
            setCurrentProxy(null);
            setInputValue(newValue);
            // Show popup if there will be content or if input is focused for typing
            if (newValue || proxies.length > 0) {
              searchPopup.current?.show();
            } else {
              searchPopup.current?.hide();
            }
          }}
          onClick={() => {
            if (inputValue || proxies.length > 0) {
              searchPopup.current?.show();
            }
          }}
          onRuxfocus={() => {
            if (inputValue || proxies.length > 0) {
              searchPopup.current?.show();
            }
          }}
          onKeyDown={handleKeyPress}
        />
      </div>
    </>
  );
};

export default SearchProxy;
