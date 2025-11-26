import { Link } from "react-router-dom";

function Landing() {
  return (
    <div className="landing">
      <header className="landing__hero">
        <h1>CoffeeOps SaaS</h1>
        <p>
          Plataforma para administrar lotes, inventarios, calidad y operaciones
          del café en un solo lugar.
        </p>
        <div className="landing__actions">
          <Link to="/app/dashboard" className="btn btn-primary">
            Probar demo
          </Link>
          <a href="#features" className="btn btn-outline">
            Ver características
          </a>
        </div>
      </header>
    </div>
  );
}

export default Landing;
