// services/label/__tests__/label.service.test.ts

import { LabelService } from '../label.service';
import { LabelRepository } from '../../../repositories/label/label.repository';
import { Etichetta } from '../../../models/Etichetta';

function creaLabelRepositoryFinto() {
  return {
    findById: jest.fn(),
    associaAIssue: jest.fn(),
  } as unknown as jest.Mocked<Pick<LabelRepository, 'findById' | 'associaAIssue'>> & LabelRepository;
}

describe('LabelService.associaAIssue', () => {
  let labelRepository: ReturnType<typeof creaLabelRepositoryFinto>;
  let labelService: LabelService;

  beforeEach(() => {
    labelRepository = creaLabelRepositoryFinto();
    labelService = new LabelService(labelRepository);
  });

  it('lancia ETICHETTA_NON_TROVATA se l\'etichetta non esiste', async () => {
    labelRepository.findById.mockResolvedValue(null);

    await expect(labelService.associaAIssue(10, 999)).rejects.toThrow('ETICHETTA_NON_TROVATA');
    expect(labelRepository.associaAIssue).not.toHaveBeenCalled();
  });

  it('associa l\'etichetta all\'issue quando entrambe esistono', async () => {
    const etichettaEsistente = Etichetta.build({ id: 2, testo: 'bug-critico', colore: '#FF0000', progettoId: 1 });
    labelRepository.findById.mockResolvedValue(etichettaEsistente);
    labelRepository.associaAIssue.mockResolvedValue(undefined as any);

    await labelService.associaAIssue(10, 2);

    expect(labelRepository.associaAIssue).toHaveBeenCalledWith(10, 2);
  });

  it('traduce SequelizeUniqueConstraintError in ETICHETTA_GIA_ASSOCIATA', async () => {
    const etichettaEsistente = Etichetta.build({ id: 2, testo: 'bug-critico', colore: '#FF0000', progettoId: 1 });
    labelRepository.findById.mockResolvedValue(etichettaEsistente);

    const erroreSequelize = new Error('Duplicate entry');
    erroreSequelize.name = 'SequelizeUniqueConstraintError';
    labelRepository.associaAIssue.mockRejectedValue(erroreSequelize);

    await expect(labelService.associaAIssue(10, 2)).rejects.toThrow('ETICHETTA_GIA_ASSOCIATA');
  });
});