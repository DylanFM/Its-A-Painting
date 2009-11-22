class Painting
  include DataMapper::Resource

  property :id,       Serial
  property :name,     String, :nullable => false
  property :history,  Text

  has n, :actions

end
