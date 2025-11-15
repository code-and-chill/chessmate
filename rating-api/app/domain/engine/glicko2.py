import math
from dataclasses import dataclass

from app.core.config import get_settings
from app.domain.engine.base import RatingEngine, RatingState


# Based on Glicko-2 system (Mark Glickman) with rating scale centered at 1500


def _g(rd: float) -> float:
    return 1 / math.sqrt(1 + 3 * (rd ** 2) / (math.pi ** 2))


def _E(mu: float, mu_j: float, rd_j: float) -> float:
    return 1 / (1 + math.exp(-_g(rd_j) * (mu - mu_j)))


class Glicko2Engine(RatingEngine):
    def __init__(self, tau: float | None = None) -> None:
        settings = get_settings()
        self.tau = tau if tau is not None else settings.GLICKO_TAU

    def expected_score(self, player: RatingState, opponent: RatingState) -> float:
        mu = (player.rating - 1500) / 173.7178
        mu_j = (opponent.rating - 1500) / 173.7178
        phi_j = opponent.rd / 173.7178
        return _E(mu, mu_j, phi_j)

    def update(self, player: RatingState, opponents: list[RatingState], scores: list[float]) -> RatingState:
        if not opponents:
            return player

        # Convert to Glicko-2 scale
        mu = (player.rating - 1500) / 173.7178
        phi = player.rd / 173.7178
        sigma = player.volatility

        mu_js = [(opp.rating - 1500) / 173.7178 for opp in opponents]
        phi_js = [opp.rd / 173.7178 for opp in opponents]

        # Step 3: Compute v (estimated variance)
        v_inv = 0.0
        for mu_j, phi_j in zip(mu_js, phi_js):
            g = _g(phi_j)
            E = 1 / (1 + math.exp(-g * (mu - mu_j)))
            v_inv += (g ** 2) * E * (1 - E)
        v = 1 / v_inv

        # Step 4: Compute Delta
        delta_sum = 0.0
        for s, mu_j, phi_j in zip(scores, mu_js, phi_js):
            g = _g(phi_j)
            E = 1 / (1 + math.exp(-g * (mu - mu_j)))
            delta_sum += g * (s - E)
        Delta = v * delta_sum

        # Step 5: Determine new sigma via iterative method
        a = math.log(sigma ** 2)

        def f(x: float) -> float:
            ex = math.exp(x)
            num = ex * (Delta ** 2 - phi ** 2 - v - ex)
            den = 2 * (phi ** 2 + v + ex) ** 2
            return (num / den) - ((x - a) / (self.tau ** 2))

        A = a
        if Delta ** 2 > (phi ** 2 + v):
            B = math.log(Delta ** 2 - phi ** 2 - v)
        else:
            k = 1
            while f(a - k * self.tau) < 0:
                k += 1
            B = a - k * self.tau

        fA = f(A)
        fB = f(B)
        # Binary search
        while abs(B - A) > 1e-6:
            C = A + (A - B) * fA / (fB - fA)
            fC = f(C)
            if fC * fB < 0:
                A = B
                fA = fB
            else:
                fA = fA / 2
            B = C
            fB = fC

        new_sigma = math.exp(A / 2)

        # Step 6: Update phi* (pre-rating period) and final values
        phi_star = math.sqrt(phi ** 2 + new_sigma ** 2)
        phi_prime = 1 / math.sqrt((1 / (phi_star ** 2)) + (1 / v))
        mu_prime = mu + (phi_prime ** 2) * delta_sum

        # Convert back to Glicko scale
        rating = 173.7178 * mu_prime + 1500
        rd = 173.7178 * phi_prime

        return RatingState(rating=rating, rd=rd, volatility=new_sigma)
