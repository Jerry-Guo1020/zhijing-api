import { Column, Entity, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../../common/entities/abstract.entity';
import { MaterialParseStatus } from '../../../common/enums/app.enums';
import { LearningPackEntity } from './learning-pack.entity';

@Entity({ name: 'pack_materials' })
export class PackMaterialEntity extends AbstractEntity {
  @Column({ name: 'pack_id' })
  packId: string;

  @Column({ name: 'file_name', length: 255 })
  fileName: string;

  @Column({ name: 'file_type', length: 50 })
  fileType: string;

  @Column({ name: 'file_size', type: 'bigint', default: 0 })
  fileSize: string;

  @Column({ name: 'storage_url', type: 'varchar', length: 255, nullable: true })
  storageUrl?: string | null;

  @Column({ name: 'raw_text', type: 'longtext', nullable: true })
  rawText?: string | null;

  @Column({
    name: 'parse_status',
    type: 'enum',
    enum: MaterialParseStatus,
    default: MaterialParseStatus.PENDING,
  })
  parseStatus: MaterialParseStatus;

  @Column({ name: 'parse_error_message', type: 'varchar', length: 255, nullable: true })
  parseErrorMessage?: string | null;

  @ManyToOne(() => LearningPackEntity, (pack) => pack.materials)
  pack: LearningPackEntity;
}
