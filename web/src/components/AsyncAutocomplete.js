import PropTypes from "prop-types";
import { compact, debounce, isEmpty, join } from "lodash";
import { useState } from "react";

const propTypes = {
  getMatches: PropTypes.func.isRequired,
  inputClassName: PropTypes.string,
  inputId: PropTypes.string,
  inputName: PropTypes.string.isRequired,
  matchesClassName: PropTypes.string,
  register: PropTypes.func.isRequired,
  registerOptions: PropTypes.object,
  setValue: PropTypes.func.isRequired,
};

const defaultProps = {
  inputClassName: null,
  inputId: null,
  matchesClassName: null,
  registerOptions: {},
};

function AsyncAutocomplete({
  getMatches,
  inputClassName,
  inputId,
  inputName,
  matchesClassName,
  register,
  registerOptions,
  setValue,
}) {
  const [activeMatchIndex, setActiveMatchIndex] = useState(-1);
  const [matches, setMatches] = useState(null);

  const { name, onBlur, onChange, ref } = register(inputName, registerOptions);

  const dismissMatches = () => {
    setMatches(null);
    setActiveMatchIndex(-1);
  };

  const handleInputBlur = (event) => {
    onBlur(event);
    dismissMatches();
  };

  const handleInputChange = (event) => {
    onChange(event);
    const searchTerm = event.target.value;

    if (isEmpty(searchTerm)) {
      dismissMatches();
      return;
    }

    debounce(() => getMatches(searchTerm, (m) => setMatches(m)), 150)();
  };

  const handleInputKeyDown = (event) => {
    if (!matches) {
      return;
    }

    let index;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        index = activeMatchIndex + 1;
        setActiveMatchIndex(index >= matches.length ? 0 : index);
        break;
      case "ArrowUp":
        event.preventDefault();
        index = activeMatchIndex - 1;
        setActiveMatchIndex(index < 0 ? matches.length - 1 : index);
        break;
      case "Enter":
        if (activeMatchIndex >= 0) {
          event.preventDefault();
          setValue(inputName, matches[activeMatchIndex]);
        }

        dismissMatches();
        break;
      case "Escape":
        dismissMatches();
        break;
      default:
        return;
    }
  };

  // We use the mousedown because it fires before blur unlike click.
  const handleMatchMouseDown = (match) => {
    setActiveMatchIndex(-1);
    setValue(inputName, match);
  };

  const handleMatchMouseEnter = (index) => {
    setActiveMatchIndex(index);
  };

  return (
    <div className="async-autocomplete">
      <input
        className={join(
          compact(["async-autocomplete__input", inputClassName]),
          " "
        )}
        id={inputId || "async-autocomplete__input"}
        name={name}
        onBlur={handleInputBlur}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        ref={ref}
        type="text"
      />

      {isEmpty(matches) || (
        <div className="async-autocomplete__matches-wrapper">
          <div
            className={join(
              compact(["async-autocomplete__matches", matchesClassName]),
              " "
            )}
            data-testid="async-autocomplete__matches"
          >
            {matches.map((match, index) => (
              <div
                className={join(
                  compact([
                    index === activeMatchIndex &&
                      "async-autocomplete__match-active",
                    "async-autocomplete__match",
                  ]),
                  " "
                )}
                key={index}
                onMouseDown={() => handleMatchMouseDown(match)}
                onMouseEnter={() => handleMatchMouseEnter(index)}
              >
                {match}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

AsyncAutocomplete.propTypes = propTypes;
AsyncAutocomplete.defaultProps = defaultProps;

export default AsyncAutocomplete;
