import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { OntologyDesigner } from '../components/OntologyDesigner';
import { DesignerPreview } from '../components/designer/DesignerPreview';
import { DesignerValidation } from '../components/designer/DesignerActions';
import { EntityForm } from '../components/designer/EntityForm';
import { RelationshipForm } from '../components/designer/RelationshipForm';
import { SubmitCatalogueModal } from '../components/designer/SubmitCatalogueModal';
import { TemplatePicker } from '../components/designer/TemplatePicker';
import { designerTemplates } from '../data/designerTemplates';
import { serializeDesignerToRDF } from '../lib/designerRdf';
import { useAppStore } from '../store/appStore';
import { useDesignerStore } from '../store/designerStore';

vi.mock('cytoscape', () => {
  const collection = {
    data: vi.fn(),
    filter: vi.fn().mockReturnThis(),
    forEach: vi.fn(),
    length: 0,
    map: vi.fn(() => []),
    merge: vi.fn().mockReturnThis(),
    remove: vi.fn(),
  };
  const core = {
    add: vi.fn(),
    collection: vi.fn(() => collection),
    destroy: vi.fn(),
    edges: vi.fn(() => collection),
    elements: vi.fn(() => collection),
    extent: vi.fn(() => ({ x1: 0, y1: 0, w: 100, h: 100 })),
    fit: vi.fn(),
    getElementById: vi.fn(() => collection),
    nodes: vi.fn(() => collection),
    on: vi.fn(),
  };
  const cytoscape = vi.fn(() => core);
  Object.assign(cytoscape, { use: vi.fn() });
  return { default: cytoscape };
});

vi.mock('cytoscape-fcose', () => ({ default: vi.fn() }));

describe('Japanese ontology designer', () => {
  beforeEach(() => {
    useDesignerStore.getState().resetDraft();
    useAppStore.getState().resetToDefault();
    HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it('renders Japanese shell, toolbar, and empty editor copy', () => {
    render(<OntologyDesigner route={{ page: 'designer' }} />);

    expect(screen.getByRole('button', { name: '戻る' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('オントロジー名')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('説明')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '新規作成' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '検証' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'エンティティ型（0）' })).toBeInTheDocument();
    expect(screen.getByText('エンティティ型はまだありません。「追加」から作成してください。')).toBeInTheDocument();
  });

  it('renders Japanese entity editor labels while keeping technical property types', async () => {
    useDesignerStore.getState().addEntity();

    render(<EntityForm />);

    expect(await screen.findByText('名前')).toBeInTheDocument();
    expect(screen.getByText('アイコン')).toBeInTheDocument();
    expect(screen.getByText('色')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('エンティティ名')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'string' })).toBeInTheDocument();
    expect(screen.getByTitle('プロパティを削除')).toBeInTheDocument();
  });

  it('renders Japanese relationship fields, accessibility labels, and validation feedback', () => {
    useDesignerStore.getState().addEntity();
    useDesignerStore.getState().addEntity();
    const [from, to] = useDesignerStore.getState().ontology.entityTypes;
    useDesignerStore.getState().addRelationship(from.id, to.id);
    const relationshipId = useDesignerStore.getState().ontology.relationships[0].id;
    useDesignerStore.getState().addRelationshipAttribute(relationshipId);

    const { unmount } = render(<RelationshipForm />);

    expect(screen.getByRole('heading', { name: 'リレーションシップ（1）' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('リレーションシップ名')).toBeInTheDocument();
    expect(screen.getByText('接続元')).toBeInTheDocument();
    expect(screen.getByText('接続先')).toBeInTheDocument();
    expect(screen.getByText('カーディナリティ')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('属性名')).toBeInTheDocument();
    expect(screen.getByTitle('属性を削除')).toBeInTheDocument();

    unmount();
    useDesignerStore.getState().validate();
    render(<DesignerValidation />);
    expect(screen.getByText(/修正が必要な問題が\d+件あります/)).toBeInTheDocument();
  });

  it('renders Japanese preview controls and local RDF import errors', () => {
    render(<DesignerPreview />);

    expect(screen.getByRole('button', { name: 'グラフ' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'RDF' }));
    fireEvent.click(screen.getByRole('button', { name: 'RDFを編集' }));

    const source = screen.getByPlaceholderText('RDF/XMLの内容を貼り付けるか編集…');
    fireEvent.change(source, { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'デザイナーに読み込む' }));

    expect(screen.getByText('先にRDF/XMLの内容を貼り付けてください')).toBeInTheDocument();
  });

  it('keeps the localized default label with the legacy designer RDF base URI', () => {
    const rdf = serializeDesignerToRDF(useDesignerStore.getState().ontology);

    expect(rdf).toContain('xml:base="http://example.org/ontology/my-ontology/"');
    expect(rdf).toContain('<rdfs:label>マイ オントロジー</rdfs:label>');
  });

  it('renders Japanese template cards without changing template payload names', () => {
    render(<TemplatePicker />);

    expect(screen.getByRole('heading', { name: 'テンプレートから始める' })).toBeInTheDocument();
    expect(screen.getByText('小売')).toBeInTheDocument();
    expect(screen.getByText('顧客、製品、注文')).toBeInTheDocument();
    const technicalFingerprints = designerTemplates.map((template) => [
      template.id,
      template.ontology.name,
      template.ontology.entityTypes.map((entity) =>
        `${entity.id}:${entity.name}[${entity.properties.map((property) => `${property.name}:${property.type}`).join(',')}]`
      ).join(';'),
      template.ontology.relationships.map((relationship) =>
        `${relationship.id}:${relationship.name}:${relationship.from}>${relationship.to}:${relationship.cardinality}`
      ).join(';'),
    ].join('|'));

    expect(technicalFingerprints).toEqual([
      'retail|Retail Ontology|customer:Customer[customerId:string,name:string,email:string,memberSince:date];product:Product[sku:string,name:string,price:decimal,category:string];order:Order[orderId:string,orderDate:date,total:decimal]|r-places:places:customer>order:one-to-many;r-contains:contains:order>product:many-to-many',
      'healthcare|Healthcare Ontology|patient:Patient[patientId:string,name:string,dateOfBirth:date,bloodType:enum];provider:Provider[npi:string,name:string,specialty:string];encounter:Encounter[encounterId:string,date:datetime,diagnosis:string]|r-has-encounter:hasEncounter:patient>encounter:one-to-many;r-seen-by:seenBy:encounter>provider:many-to-one',
      'finance|Finance Ontology|party:Party[partyId:string,name:string,type:enum];account:Account[accountNumber:string,accountType:enum,balance:decimal,openedDate:date];transaction:Transaction[transactionId:string,amount:decimal,timestamp:datetime,type:enum]|r-owns:owns:party>account:one-to-many;r-has-txn:hasTransaction:account>transaction:one-to-many',
      'iot|IoT Ontology|device:Device[deviceId:string,manufacturer:string,firmwareVersion:string,installedDate:date];sensor:Sensor[sensorId:string,sensorType:enum,unit:string];reading:Reading[readingId:string,value:decimal,timestamp:datetime]|r-has-sensor:hasSensor:device>sensor:one-to-many;r-produces:produces:sensor>reading:one-to-many',
      'education|Education Ontology|student:Student[studentId:string,name:string,enrollmentYear:integer];course:Course[courseCode:string,title:string,credits:integer];instructor:Instructor[instructorId:string,name:string,department:string]|r-enrolled-in:enrolledIn:student>course:many-to-many;r-taught-by:taughtBy:course>instructor:many-to-one',
    ]);
  });

  it('renders Japanese catalogue submission guidance while preserving technical paths', () => {
    render(<SubmitCatalogueModal onClose={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'カタログへ投稿' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '投稿方法' })).toBeInTheDocument();
    expect(screen.getByText('catalogue/community/your-username/')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /RDFをダウンロード/ })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: '閉じる' })).toHaveLength(2);
  });
});
