from fastapi import APIRouter, Depends, HTTPException
from app.dependencies import get_current_user
from app.models.models import User
from app.schemas.schemas import TriageRequest, TriageResponse

router = APIRouter(prefix="/triage", tags=["Triage"])

# Mock simples baseado em palavras-chave
MOCK_RESPONSES = [
    {"keywords": ["febre", "tosse", "garganta"], "diagnosis": "Possível infeção respiratória", "urgency": "medium", "recommendations": "Repouso, hidratação e consulta médica se febre persistir por mais de 3 dias."},
    {"keywords": ["dores de cabeça", "enxaqueca"], "diagnosis": "Possível cefaleia tensional", "urgency": "low", "recommendations": "Evitar stress, beber água, analgésico leve se necessário."},
    {"keywords": ["dor no peito", "falta de ar"], "diagnosis": "Sintomas cardiorrespiratórios", "urgency": "emergency", "recommendations": "Procure atendimento médico urgente imediatamente!"},
    {"keywords": ["náuseas", "vómitos", "diarreia"], "diagnosis": "Possível gastroenterite", "urgency": "medium", "recommendations": "Hidratação oral, dieta leve e consulta se piorar."},
    {"keywords": ["alergia", "comichão", "urticária"], "diagnosis": "Reacção alérgica", "urgency": "low", "recommendations": "Anti-histamínico oral e evitar alergénio. Se dificuldade respiratória, emergência."},
]

@router.post("/", response_model=TriageResponse)
def triage(
    request: TriageRequest,
    current_user: User = Depends(get_current_user)
):
    # Mock de triagem de sintomas usando IA, baseado apenas palavras-chave
    symptoms_lower = request.symptoms.lower()
    for item in MOCK_RESPONSES:
        if any(keyword in symptoms_lower for keyword in item["keywords"]):
            return TriageResponse(
                possible_diagnosis=item["diagnosis"],
                urgency=item["urgency"],
                recommendations=item["recommendations"]
            )
    # Resposta genérica
    return TriageResponse(
        possible_diagnosis="Sintomas não específicos",
        urgency="low",
        recommendations="Monitorize os sintomas. Consulte um médico se houver agravamento."
    )