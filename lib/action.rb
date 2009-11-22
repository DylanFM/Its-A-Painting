class Action
  include DataMapper::Resource

  property :id,           Serial
  property :steps,        Text,     :nullable => false
  property :painting_id,  Integer,  :index => true

  belongs_to :painting

end