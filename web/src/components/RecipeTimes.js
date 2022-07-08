import PropTypes from "prop-types";
import { compact, isEmpty, join, sortBy } from "lodash";
import { Link } from "react-router-dom";

const propTypes = {
  data: PropTypes.shape({
    id: PropTypes.number.isRequired,
    recipe_times: PropTypes.array,
  }).isRequired,
};

function formatRecipeTime(time) {
  const days = time.days && `${time.days}d`;
  const hours = time.hours && `${time.hours}h`;
  const minutes = time.minutes && `${time.minutes}m`;
  return join(compact([days, hours, minutes]), " ");
}

function recipeTimes({ data }) {
  return (
    <div className="recipe-times">
      <div className="recipe-times__heading-wrapper">
        <h2 className="recipe-times__heading">Times</h2>

        <Link
          className="recipe-times__heading-action"
          to={`/recipe/${data.id}/time/new`}
        >
          Create
        </Link>
      </div>

      {isEmpty(data.recipe_times) ? (
        <p className="recipe-times__empty-notice">
          Times haven't been created yet.
        </p>
      ) : (
        <div className="recipe-times__list-wrapper">
          <div className="recipe-times__list">
            {sortBy(data.recipe_times, "time_type").map((rt) => (
              <Link key={rt.id} to={`/recipe/${data.id}/time/${rt.id}/edit`}>
                <div
                  className="recipe-times__list-item"
                  data-testid="recipe-times__list-item"
                >
                  <span className="recipe-times__time-type">
                    {rt.time_type}:
                  </span>
                  <span className="recipe-times__time-value">
                    {formatRecipeTime(rt)}
                    {isEmpty(rt.note) || (
                      <span className="recipe-times__time-note">
                        <em>({rt.note})</em>
                      </span>
                    )}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

recipeTimes.propTypes = propTypes;

export default recipeTimes;
