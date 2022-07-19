import PropTypes from "prop-types";
import Spinner from "../components/Spinner";
import useOutsideClick from "../hooks/useOutsideClick";
import { compact, join } from "lodash";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRef, useState } from "react";

const propTypes = {
  buttonClassName: PropTypes.string,
  buttonText: PropTypes.string.isRequired,
  buttonType: PropTypes.string,
  menuClassName: PropTypes.string,
  menuItemClassName: PropTypes.string,
  menuItems: PropTypes.arrayOf(
    PropTypes.shape({
      handleClick: PropTypes.func.isRequired,
      text: PropTypes.string.isRequired,
    })
  ).isRequired,
  spin: PropTypes.bool.isRequired,
};

const defaultProps = {
  buttonClassName: "",
  buttonType: "button",
  menuClassName: "",
  menuItemClassName: "",
};

function DropdownButton({
  buttonClassName,
  buttonText,
  buttonType,
  menuClassName,
  menuItemClassName,
  menuItems,
  spin,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const buttonRef = useRef();

  const menuRef = useOutsideClick((evt) => {
    // Avoid interfering with button click handler. That will open menu again.
    if (buttonRef.current && !buttonRef.current.contains(evt.target)) {
      setShowMenu(false);
    }
  });

  const handleButtonClick = () => {
    setShowMenu((prevShowMenu) => !prevShowMenu);
  };

  const handleMenuItemClick = (evt, handleClick) => {
    // Avoid bubbling event to parent button. That will open menu again.
    evt.stopPropagation();
    setShowMenu(false);
    handleClick();
  };

  buttonClassName = join(
    compact(["dropdown-button__menu-button", buttonClassName]),
    " "
  );

  menuClassName = join(
    compact(["dropdown-button__button-menu-wrapper", menuClassName]),
    " "
  );

  menuItemClassName = join(
    compact(["dropdown-button__button-menu-item", menuItemClassName]),
    " "
  );

  return (
    <>
      <button
        className={buttonClassName}
        data-testid="dropdown-button__button"
        onClick={handleButtonClick}
        ref={buttonRef}
        type={buttonType}
      >
        <Spinner spin={spin}>
          <FontAwesomeIcon icon={faCaretDown} />
        </Spinner>{" "}
        {buttonText}
        {showMenu && (
          <div
            className={menuClassName}
            data-testid="dropdown-button__button-menu-wrapper"
            ref={menuRef}
          >
            <ul className="dropdown-button__button-menu">
              {menuItems.map(({ handleClick, text }, index) => (
                <li
                  className={menuItemClassName}
                  key={index}
                  onClick={(evt) => handleMenuItemClick(evt, handleClick)}
                >
                  {text}
                </li>
              ))}
            </ul>
          </div>
        )}
      </button>
    </>
  );
}

DropdownButton.defaultProps = defaultProps;
DropdownButton.propTypes = propTypes;

export default DropdownButton;
