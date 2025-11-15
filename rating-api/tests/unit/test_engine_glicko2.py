from app.domain.engine.base import RatingState
from app.domain.engine.glicko2 import Glicko2Engine


def test_glicko2_update_runs():
    engine = Glicko2Engine(tau=0.5)
    a = RatingState(1500, 350, 0.06)
    b = RatingState(1500, 350, 0.06)
    out = engine.update(a, [b], [1.0])
    assert isinstance(out.rating, float)
    assert out.rd > 0
