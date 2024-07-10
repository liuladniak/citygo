import Button from "../Button/Button";
import "./Featured.scss";

const Featured = () => {
  return (
    <div className="featured-wrp">
      <div className="featured">
        <div className="featured-content">
          <div className="featured-text">
            <h2 className="featured-title">Fusce feugiat nibh vitae</h2>
            <p className="featured-description">
              Mauris sit amet turpis at leo pellentesque scelerisque. Maecenas
              felis mi, euismod ac suscipit quis, rhoncus id metus. Ut ut sem
              non purus feugiat volutpat ut nec felis. Fusce feugiat nibh vitae
              purus volutpat, mollis varius sapien viverra. Aenean sed mauris
              sit amet lectus sagittis consectetur sed et magna. Etiam consequat
              est sed accumsan mattis.
            </p>
          </div>
          <Button className="btn--something">Something</Button>
        </div>

        {/* <div className="featured-img"></div> */}
      </div>
    </div>
  );
};

export default Featured;
